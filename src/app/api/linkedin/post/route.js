import { db } from "@/lib/db";
import { authenticated } from "@/lib/crud";
import { json, error } from "@/lib/api";

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;

  // Fetch fresh user data including LinkedIn token
  const fullUser = await db.user.findUnique({ where: { id: user.id } });

  if (!fullUser?.linkedinAccessToken) {
    return error("LinkedIn account not connected. Please connect it in Settings.", 401);
  }

  // Check if token is expired
  if (fullUser.linkedinTokenExpiry && new Date() > new Date(fullUser.linkedinTokenExpiry)) {
    return error("LinkedIn token expired. Please reconnect your LinkedIn account in Settings.", 401);
  }

  const body = await request.json();
  const { text, mediaUrls } = body;

  if (!text || text.trim().length === 0) {
    return error("Post text is required.");
  }

  // First get the LinkedIn member ID (URN)
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${fullUser.linkedinAccessToken}` },
  });

  if (!profileRes.ok) {
    return error("Could not fetch LinkedIn profile. Please reconnect your account.", 400);
  }

  const profileData = await profileRes.json();
  const authorUrn = `urn:li:person:${profileData.sub}`;

  let imageUrn = null;

  // If there are images, upload the first one to LinkedIn
  if (mediaUrls && mediaUrls.length > 0) {
    try {
      const imageUrl = mediaUrls[0];
      const imgRes = await fetch(imageUrl);
      
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();

        // Initialize upload
        const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${fullUser.linkedinAccessToken}`,
            "Content-Type": "application/json",
            "LinkedIn-Version": "202605",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: authorUrn
            }
          })
        });

        if (initRes.ok) {
          const initData = await initRes.json();
          const uploadUrl = initData.value.uploadUrl;
          imageUrn = initData.value.image;

          // Upload image bytes
          await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/octet-stream"
            },
            body: imgBuffer
          });
        }
      }
    } catch (e) {
      console.error("Failed to upload image to LinkedIn:", e);
      // Continue without image if upload fails
    }
  }

  const postPayload = {
    author: authorUrn,
    commentary: text,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false
  };

  if (imageUrn) {
    postPayload.content = {
      media: {
        id: imageUrn
      }
    };
  }

  // Create the LinkedIn post
  const postRes = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fullUser.linkedinAccessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202605",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(postPayload),
  });

  if (!postRes.ok) {
    const errData = await postRes.text();
    console.error("LinkedIn post error:", errData);
    return error("Failed to post to LinkedIn. Please try again.", 400);
  }

  return json({ success: true, message: "Successfully posted to LinkedIn!" });
}

export async function DELETE(request) {
  const { user, response } = await authenticated();
  if (response) return response;

  await db.user.update({
    where: { id: user.id },
    data: {
      linkedinAccessToken: null,
      linkedinTokenExpiry: null,
    },
  });

  return json({ success: true, message: "LinkedIn disconnected." });
}
