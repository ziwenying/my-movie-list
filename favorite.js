// function removeFromFavorite(id) {
//   //判斷如果 movies 非陣列或是為空陣列，則結束函式。
//   if (!movies || !movies.length) return

//   //如果找到 movies 陣列中的 id 與 此「id」相同時，使用 findIndex 找出此「id」在 movies 中的 index，並回傳。
//   const movieIndex = movies.findIndex((movie) => movie.id === id)

//   //如果 movieIndex 為 -1 代表沒有與 此「id」相同的電影存在，結束函式。
//   if (movieIndex === -1) return

//   //使用 splice ，從 movies 陣列中的第 movieIndex 個開始刪除，刪除 1 部電影。
//   movies.splice(movieIndex, 1)

//   //把修改過後的 favoriteMovies 值，使用 JSON.stringify() 轉換，並重新存入 localStorage。
//   localStorage.setItem('favoriteMovies', JSON.stringify(movies))

//   //重新 render 出修改過的電影清單
//   renderMovieList(movies)
// }


const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const search = document.querySelector('#search-form')
const inputKey = document.querySelector('#search-input')
const dataPanel = document.querySelector('#data-panel')



function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">-</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}


function removeFavorite(id) {

  if (!movies || !movies.length) return //防止 movies 是空陣列的狀況，不是很懂？？
  //找到 movie 在陣列裡面的位置，使用 findIndex 函式
  const movieIndex = movies.findIndex((movie) => movie.id === id) // find 會 return 符合條件的 movie
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)//及時出現刪除結果
}


dataPanel.addEventListener('click', function onPanelClicked(e) {
  const id = Number(e.target.dataset.id)
  if (e.target.matches('.btn-show-movie')) {
    // console.log(e.target.dataset.id)
    showMovieModal(id)
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFavorite(id)
    console.log(id)
  }
})


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  modalTitle.innerText = ''
  modalImage.innerText = ''
  modalDate.innerText = ''
  modalDescription.innerHTML = ''

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    // console.log(id)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

renderMovieList(movies)