const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user"));

if (!token) {
  window.location.href = "/index.html";
}

const feedContainer = document.getElementById("feedContainer");
const postBtn = document.getElementById("postBtn");
const captionInput = document.getElementById("caption");

const searchInput = document.getElementById("searchUser");
const searchResults = document.getElementById("searchResults");

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/index.html";
});

// CREATE POST
postBtn.addEventListener("click", async () => {
  console.log("POST BUTTON CLICKED");

  const caption = captionInput.value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!caption && !imageFile) return;

  try {
    const formData = new FormData();

    formData.append("caption", caption);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {
      alert(data.message);
      return;
    }

    captionInput.value = "";
    document.getElementById("image").value = "";

    fetchPosts();
  } catch (error) {
    console.log("Create post error:", error);
  }
});

// FETCH POSTS
const fetchPosts = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      console.log("Invalid posts response:", posts);
      return;
    }

    feedContainer.innerHTML = "";

    posts.forEach((post) => {
      if (!post || !post.user) return; // IMPORTANT SAFETY CHECK

      const postDiv = document.createElement("div");
      postDiv.classList.add("post-card");

      postDiv.innerHTML = `
<h3>
      <img
  src="${
    post.user.profilePic
      ? `http://localhost:5000/uploads/${post.user.profilePic}`
      : `https://ui-avatars.com/api/?name=${post.user.username}`
  }"
  class="profile-pic"
/> 

    <a href="profile.html?id=${post.user._id}">
        @${post.user.username}
    </a>
</h3>

<p>${post.caption || ""}</p>

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

<button onclick="likePost('${post._id}')">
    ❤️ ${post.likes.length}
</button>

${
  currentUser && currentUser._id === post.user._id
    ? `
      <button onclick="editPost('${post._id}', '${post.caption}')">
          ✏️ Edit
      </button>
      <button onclick="deletePost('${post._id}')">
          🗑 Delete
      </button>
    `
    : ""
}

<div class="comment-section">

    <input
        type="text"
        id="comment-${post._id}"
        placeholder="Write comment..."
    >

    <button onclick="addComment('${post._id}')">
        Comment
    </button>

    <div id="comments-${post._id}"></div>

</div>
`;

      feedContainer.appendChild(postDiv);
      fetchComments(post._id);
    });
  } catch (error) {
    console.log("Fetch posts error:", error);
  }
};

// FETCH COMMENTS
const fetchComments = async (postId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const comments = await res.json();

    const commentsDiv = document.getElementById(`comments-${postId}`);
    if (!commentsDiv) return;

    commentsDiv.innerHTML = "";

    comments.forEach((comment) => {
      if (!comment || !comment.user) return;

      commentsDiv.innerHTML += `
        <p>
          <strong>@${comment.user.username}</strong>
          ${comment.text}
        </p>
      `;
    });
  } catch (error) {
    console.log("Fetch comments error:", error);
  }
};

// DELETE POST
async function deletePost(id) {
  const confirmDelete = confirm("Delete this post?");

  if (!confirmDelete) return;

  try {
    await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPosts();
  } catch (error) {
    console.log(error);
  }
}

//EDIT POST
async function editPost(id, oldCaption) {
  const newCaption = prompt("Edit your post", oldCaption);

  if (!newCaption) return;

  try {
    const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        caption: newCaption,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    fetchPosts();
  } catch (error) {
    console.log(error);
  }
}

// LIKE POST
const likePost = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/posts/like/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      console.log(data.message);
      return;
    }

    fetchPosts();
  } catch (error) {
    console.log("Like error:", error);
  }
};

// ADD COMMENT
const addComment = async (postId) => {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value.trim();

  if (!text) return;

  try {
    const res = await fetch(`http://localhost:5000/api/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.log(data.message);
      return;
    }

    input.value = "";
    fetchPosts();
  } catch (error) {
    console.log("Comment error:", error);
  }
};

searchInput.addEventListener("keyup", searchUsers);

async function searchUsers() {
  const keyword = searchInput.value.trim();

  console.log("Searching:", keyword);

  if (!keyword) {
    searchResults.innerHTML = "";

    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/users/search/users?username=${keyword}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const users = await res.json();

    console.log("Users found:", users);

    searchResults.innerHTML = "";

    users.forEach((user) => {
      searchResults.innerHTML += `
        <div class="search-user">

            <a href="profile.html?id=${user._id}">
                👤 @${user.username}
            </a>

        </div>
        `;
    });
  } catch (error) {
    console.log(error);
  }
}

// INIT
fetchPosts();
