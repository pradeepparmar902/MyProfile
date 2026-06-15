const { db } = require("./src/lib/db");

async function run() {
  const invites = await db.invite.findMany({});
  console.log("Invites:", invites.map(i => i.id));
}
run();
