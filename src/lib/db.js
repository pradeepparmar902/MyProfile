const collections = {
  user: "users",
  profile: "profiles",
  education: "education",
  achievement: "achievements",
  project: "projects",
  skill: "skills",
  internship: "internships",
  profession: "professions",
  professionSelf: "professionsSelf",
  profileView: "profileViews",
  media: "media",
  outOfBox: "outOfBox",
  hobby: "hobbies",
  wish: "wishes",
  sport: "sports",
  activity: "activities",
  invite: "invites",
};

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function now() {
  return new Date().toISOString();
}

function clean(data) {
  return Object.fromEntries(
    Object.entries(data || {}).filter(([, value]) => value !== undefined)
  );
}

function toFirestoreValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(clean(data)).map(([key, value]) => [key, toFirestoreValue(value)])
    ),
  };
}

function fromFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, fromFirestoreValue(item)])
    );
  }
  return undefined;
}

function fromFirestoreDoc(doc) {
  if (!doc) return null;
  const id = doc.name.split("/").pop();
  const data = Object.fromEntries(
    Object.entries(doc.fields || {}).map(([key, value]) => [key, fromFirestoreValue(value)])
  );
  return {
    ...data,
    id,
    createdAt: data.createdAt ? new Date(data.createdAt) : null,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
    viewedAt: data.viewedAt ? new Date(data.viewedAt) : null,
  };
}

async function firestoreFetch(path, options = {}) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${baseUrl}${path}${separator}key=${apiKey}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Firestore request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function getById(name, id) {
  if (!id) return null;
  try {
    const doc = await firestoreFetch(`/${collections[name]}/${id}`);
    return fromFirestoreDoc(doc);
  } catch (error) {
    if (String(error.message).includes("NOT_FOUND")) return null;
    return null;
  }
}

function matchesWhere(row, whereArg = {}) {
  return Object.entries(whereArg).every(([key, value]) => {
    if (value && typeof value === "object" && "in" in value) {
      return value.in.includes(row[key]);
    }
    return row[key] === value;
  });
}

function sortAndLimit(rows, args = {}) {
  let result = [...rows];

  if (args.orderBy) {
    const [field, direction] = Object.entries(args.orderBy)[0];
    result.sort((a, b) => {
      const first = a[field] instanceof Date ? a[field].getTime() : a[field] ?? "";
      const second = b[field] instanceof Date ? b[field].getTime() : b[field] ?? "";
      if (first < second) return direction === "desc" ? 1 : -1;
      if (first > second) return direction === "desc" ? -1 : 1;
      return 0;
    });
  }

  if (args.take) result = result.slice(0, args.take);
  return result;
}

async function listCollection(name) {
  const result = await firestoreFetch(`/${collections[name]}?pageSize=1000`);
  return (result.documents || []).map(fromFirestoreDoc);
}

async function findMany(name, args = {}) {
  if (args.where?.id) {
    const row = await getById(name, args.where.id);
    const rows = row && matchesWhere(row, args.where) ? [row] : [];
    return sortAndLimit(rows, args);
  }

  const rows = await listCollection(name);
  return sortAndLimit(rows.filter((row) => matchesWhere(row, args.where || {})), args);
}

async function findFirst(name, args = {}) {
  const results = await findMany(name, { ...args, take: 1 });
  return results[0] || null;
}

async function findUnique(name, args = {}) {
  const whereArg = args.where || {};
  const record = whereArg.id
    ? await getById(name, whereArg.id)
    : await findFirst(name, { where: whereArg });
  return hydrate(name, record, args.include);
}

async function createRecord(name, args = {}) {
  const data = clean({
    ...(args.data || {}),
    createdAt: now(),
    updatedAt: now(),
  });

  if (name === "user" && args.data?.profile?.create) {
    const profileCreate = args.data.profile.create;
    delete data.profile;
    const createdUser = await firestoreFetch(`/${collections.user}`, {
      method: "POST",
      body: JSON.stringify(toFirestoreFields(data)),
    });
    const user = fromFirestoreDoc(createdUser);
    const createdProfile = await firestoreFetch(`/${collections.profile}`, {
      method: "POST",
      body: JSON.stringify(
        toFirestoreFields({
          ...profileCreate,
          userId: user.id,
          createdAt: now(),
          updatedAt: now(),
        })
      ),
    });
    const profile = fromFirestoreDoc(createdProfile);
    return hydrate("user", { ...user, profile }, args.include);
  }

  const created = await firestoreFetch(`/${collections[name]}`, {
    method: "POST",
    body: JSON.stringify(toFirestoreFields(data)),
  });
  return fromFirestoreDoc(created);
}

async function updateRecord(name, args = {}) {
  const data = clean({
    ...(args.data || {}),
    updatedAt: now(),
  });
  const updateMask = Object.keys(data).map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
  const updated = await firestoreFetch(`/${collections[name]}/${args.where.id}?${updateMask}`, {
    method: "PATCH",
    body: JSON.stringify(toFirestoreFields(data)),
  });
  return fromFirestoreDoc(updated);
}

async function deleteRecord(name, args = {}) {
  await firestoreFetch(`/${collections[name]}/${args.where.id}`, { method: "DELETE" });
  return { id: args.where.id };
}

async function countRecords(name, args = {}) {
  const rows = await findMany(name, args);
  return rows.length;
}

async function upsertProfile(args = {}) {
  const existing = await findUnique("profile", { where: args.where });
  if (existing) {
    return updateRecord("profile", { where: { id: existing.id }, data: args.update });
  }
  return createRecord("profile", { data: args.create });
}

async function hydrate(name, record, include) {
  if (!record) return null;

  if (name === "user" && include?.profile && !record.profile) {
    return {
      ...record,
      profile: await findUnique("profile", { where: { userId: record.id } }),
    };
  }

  if (name === "profile" && include?.user) {
    const user = (await getById("user", record.userId)) || { id: record.userId, name: "User", email: "" };
    const selected = include.user.select || {};
    const hydratedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    if (selected.education) hydratedUser.education = await findMany("education", { where: { userId: user.id }, orderBy: selected.education.orderBy });
    if (selected.achievements) hydratedUser.achievements = await findMany("achievement", { where: { userId: user.id, ...(selected.achievements.where || {}) }, orderBy: selected.achievements.orderBy });
    if (selected.projects) hydratedUser.projects = await findMany("project", { where: { userId: user.id }, orderBy: selected.projects.orderBy });
    if (selected.skills) hydratedUser.skills = await findMany("skill", { where: { userId: user.id }, orderBy: selected.skills.orderBy });
    if (selected.internships) hydratedUser.internships = await findMany("internship", { where: { userId: user.id }, orderBy: selected.internships.orderBy });
    if (selected.professions) hydratedUser.professions = await findMany("profession", { where: { userId: user.id }, orderBy: selected.professions.orderBy });
    if (selected.professionsSelf) hydratedUser.professionsSelf = await findMany("professionSelf", { where: { userId: user.id }, orderBy: selected.professionsSelf.orderBy });
    if (selected.outOfBox) hydratedUser.outOfBox = await findMany("outOfBox", { where: { userId: user.id }, orderBy: selected.outOfBox.orderBy });
    if (selected.hobbies) hydratedUser.hobbies = await findMany("hobby", { where: { userId: user.id }, orderBy: selected.hobbies.orderBy });
    if (selected.wishes) hydratedUser.wishes = await findMany("wish", { where: { userId: user.id }, orderBy: selected.wishes.orderBy });
    if (selected.sports) hydratedUser.sports = await findMany("sport", { where: { userId: user.id }, orderBy: selected.sports.orderBy });
    if (selected.activities) hydratedUser.activities = await findMany("activity", { where: { userId: user.id }, orderBy: selected.activities.orderBy });
    return { ...record, user: hydratedUser };
  }

  return record;
}

function model(name) {
  return {
    findUnique: (args) => findUnique(name, args),
    findFirst: (args) => findFirst(name, args),
    findMany: (args) => findMany(name, args),
    create: (args) => createRecord(name, args),
    update: (args) => updateRecord(name, args),
    delete: (args) => deleteRecord(name, args),
    count: (args) => countRecords(name, args),
    upsert: name === "profile" ? upsertProfile : undefined,
  };
}

export const db = {
  user: model("user"),
  profile: model("profile"),
  education: model("education"),
  achievement: model("achievement"),
  project: model("project"),
  skill: model("skill"),
  internship: model("internship"),
  profession: model("profession"),
  professionSelf: model("professionSelf"),
  profileView: model("profileView"),
  media: model("media"),
  outOfBox: model("outOfBox"),
  hobby: model("hobby"),
  wish: model("wish"),
  sport: model("sport"),
  activity: model("activity"),
  invite: model("invite"),
  $transaction: (operations) => Promise.all(operations),
};
