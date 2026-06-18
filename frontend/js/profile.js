const token = localStorage.getItem("token");

const currentUser = JSON.parse(localStorage.getItem("user"));

const params = new URLSearchParams(window.location.search);

const profileId = params.get("id") || currentUser._id;

const profileInfo = document.getElementById("profileInfo");

const userPosts = document.getElementById("userPosts");

const uploadBtn = document.getElementById("uploadBtn");

if (uploadBtn) {
  uploadBtn.addEventListener(
    "click",
    uploadProfilePic
  );
}

// LOAD PROFILE
async function loadProfile() {
  const res = await fetch(`http://localhost:5000/api/users/${profileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  const isFollowing = data.user.followers.includes(currentUser._id);

  profileInfo.innerHTML = `
        ${
          data.user.profilePic
            ? `
      <img
        src="http://localhost:5000/uploads/${data.user.profilePic}"
        class="profile-pic"
      >
    `
            : ""
        }
        <h1>${data.user.username}</h1>

        <p>${data.user.bio || "No bio yet"}</p>

        <p>
            Followers:
            ${data.user.followers.length}
        </p>

        <p>
            Following:
            ${data.user.following.length}
        </p>
        ${
          profileId !== currentUser._id
            ? `
            <button
                id="followBtn"
                onclick="followUser()"
            >
                ${isFollowing ? "Unfollow" : "Follow"}
            </button>
        `
            : ""
        }
        ${
          profileId === currentUser._id
            ? `
        <div class="profile-upload">
            <input
                type="file"
                id="profileImage"
            >

            <button
                id="uploadBtn"
            >
                Update Profile Picture
            </button>
        </div>
      `
            : ""
        }
    `;

  userPosts.innerHTML = "";

  data.posts.forEach((post) => {
    userPosts.innerHTML += `

    <div class="post-card">

      <h4>
        ${data.user.username}
      </h4>

      <p>
        ${post.caption || ""}
      </p>

      ${
        post.image
          ? `
            <img
              src="http://localhost:5000/uploads/${post.image}"
              class="post-image"
              alt="post image"
            >
          `
          : ""
      }

    </div>

  `;
  });
}

// FOLLOW USER
async function followUser() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/users/follow/${profileId}`,

      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();

    alert(data.message);

    loadProfile();
  } catch (error) {
    console.log(error);
  }
}

//UPLOAD PROFILE PICTURE
async function uploadProfilePic() {
  const imageFile = document.getElementById("profileImage").files[0];

  if (!imageFile) {
    alert("Select an image");
    return;
  }

  const formData = new FormData();

  formData.append("image", imageFile);

  try {
    const res = await fetch("http://localhost:5000/api/users/profile-picture", {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const data = await res.json();

    alert(data.message);

    loadProfile();
  } catch (error) {
    console.log(error);
  }
}

loadProfile();
