// 宣告變數
const indexURL = "https://lighthouse-user-api.herokuapp.com/api/v1/users";

const users = [];
let filterUsers = []

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const navbar = document.querySelector("#navbarSupportedContent")
const USERS_PER_PAGE = 15

const userModalTitle = document.querySelector("#user-modal-title");
const userModalAvatar = document.querySelector("#user-modal-avatar");
const userModalGender = document.querySelector("#user-modal-gender");
const userModalAge = document.querySelector("#user-modal-age");
const userModalBirthday = document.querySelector("#user-modal-birthday");
const userModalEmail = document.querySelector("#user-modal-email");
const userModalRegion = document.querySelector("#user-modal-region");

// 函式
// 動態生成user card
function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    console.log(item);
    rawHTML += `
    <div class="card border-secondary">
       <img src=${item.avatar} class="card-img" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}" alt="user-avatar">
       <div class="card-footer text-muted">
         <p class="user-name text-center align-middle mb-1">${item.name} ${item.surname}</p>
         <i class="fas fa-heart add-closed-friends like" data-id="${item.id}"></i>
       </div>
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// 渲染已是摯友的摯友按鈕樣式
function renderLikedBtn() {
  const closedFriendsList = JSON.parse(localStorage.getItem('closeFriends')) || []
  const closedFriendsId = []
  let likedBtns = document.querySelectorAll('.add-closed-friends')
  closedFriendsList.forEach(friend => {
    closedFriendsId.push(friend.id)
  })
  for (likedbtn of likedBtns) {
    closedFriendsId.forEach(id => {
      if (id === Number(likedbtn.dataset.id)) {
        likedbtn.className = 'fas fa-heart add-closed-friends liked'
      }
    })
  }
}


// 點擊大頭貼顯示用戶詳細資訊
function showUserModal(id) {
  axios
    .get(indexURL + `/${id}`)
    .then((response) => {
      const data = response.data;
      userModalTitle.innerText = `${data.name}  ${data.surname}`;
      userModalGender.innerText = `Gender: ${data.gender}`;
      userModalAvatar.innerHTML = `<img
                src="${data.avatar}"
                alt="user-avatar">`;
      userModalAge.innerText = `Age: ${data.age}`;
      userModalBirthday.innerText = `Birth Date: ${data.birthday}`;
      userModalEmail.innerText = `Email: ${data.email}`;
      userModalRegion.innerText = `Region: ${data.region}`;
    })
    .catch((err) => {
      console.log(err);
    });
}


// 新增為摯友
function addCloseFriend(id) {
  const closeFriendsList = JSON.parse(localStorage.getItem('closeFriends')) || []
  const user = users.find(user => user.id === id)
  if (closeFriendsList.some(user => user.id === id)) {
    return alert('此用戶已在摯友名單中!')
  }
  closeFriendsList.push(user)
  localStorage.setItem('closeFriends', JSON.stringify(closeFriendsList))
}



// 每頁顯示固定數量的用戶
function getUsersByPage(page) {
  const data = filterUsers.length ? filterUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 渲染分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


// 設置監聽器, 點擊頭像時, 跳出modal並調用函式渲染modal
dataPanel.addEventListener("click", (event) => {
  if (event.target.matches(".card-img")) {
    // event.target.dataset.id是字串, 要先轉成數字
    showUserModal(Number(event.target.dataset.id));
  } else if (event.target.matches('.add-closed-friends')) {
    // 點擊愛心時新增至摯友頁面
    addCloseFriend(Number(event.target.dataset.id))
    renderLikedBtn()
  }
});

// 在search bar設置監聽器
searchForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterUsers = users.filter(user => { return (user.name.toLowerCase().includes(keyword)) || (user.surname.toLowerCase().includes(keyword)) })

  if (!filterUsers.length) {
    return alert(`找不到和關鍵字 ${keyword} 相關的用戶`)
  }
  renderPaginator(filterUsers.length)
  renderUserList(getUsersByPage(1))
  renderLikedBtn()
})

// 在分頁器設置監聽器, 點擊頁數按鈕時, 顯示相應頁數的資料
paginator.addEventListener("click", event => {
  if (event.target.tagName !== 'A') return
  console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
  renderLikedBtn()
})


// 串接API請求資料
axios
  .get(indexURL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1))
    renderLikedBtn()
  })
  .catch((err) => {
    console.log(err);
  });