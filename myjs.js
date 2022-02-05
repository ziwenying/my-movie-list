const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const search = document.querySelector('#search-form')
const inputKey = document.querySelector('#search-input')
const dataPanel = document.querySelector('#data-panel')
const MOVIES_PER_PAGE = 12 //每頁 12 筆
const pagination = document.querySelector('.pagination')
//用來裝篩出的符合條件的電影
let searchMovie = []
let currentPage = 1
const changeListCard = document.querySelector('.change-list')
const searchForm = document.querySelector('#search-form')
let lastSearchMovie = []

function renderMovieList(data) {
  let rawHTML = ``
  if (dataPanel.dataset.mode === 'card') {
    console.log(dataPanel.dataset.mode)
    //render card
    data.forEach((item) => {
      // title, image
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
  } else if (dataPanel.dataset.mode === 'list') {
    console.log(dataPanel.dataset.mode)
    rawHTML += `
      <ul class="list-group">
    `
    //render list
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item ">
          ${item.title}
          <button class="btn btn-primary btn-show-movie right-list1" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite right-list2" data-id="${item.id}">+</button>
        </li>
      `
    })
    rawHTML += `
      </ul>
    `
  }
  dataPanel.innerHTML = rawHTML
  console.log(dataPanel)
}



dataPanel.addEventListener('click', function onPanelClicked(e) {
  const id = Number(e.target.dataset.id)
  console.log(e)
  if (e.target.matches('.btn-show-movie')) {
    // console.log(e.target.dataset.id)
    showMovieModal(id)
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(id)
  }
})

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id) // find 會 return 符合條件的 movie
  if (list.some((movie) => movie.id === id)) { //some 如符合條件，會回傳 true 
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  alert('ㄟ')
}

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

search.addEventListener('submit', function submittedForm(e) {
  e.preventDefault()
  //trim 去頭尾空白、toLowerCase 轉小寫達到不分大小寫的效果
  const keyword = inputKey.value.trim().toLowerCase()

  //方法一：篩選條件使用 filter
  // searchMovie = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  //方法二：使用迴圈 for-of
  searchMovie = []
  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      searchMovie.push(movie)
    }
  }
  //搜尋不到符合的結果
  if (searchMovie.length === 0) {
    return alert('there are not results')
  }
  currentPage = 1
  //使用 lastSearchMovie 來存放上次搜尋的結果
  lastSearchMovie = searchMovie
  //重製分頁器
  renderPaginator(lastSearchMovie.length)

  //重新渲染篩出的電影的畫面
  renderMovieList(getMoviesByPage(currentPage))
})

function getMoviesByPage(page) {
  //if searchMovie.length === true, 把 searchMovie.length 賦值給 searchMovie, false 則給 movies
  // const data = searchMovie.length ? searchMovie : movies
  let data = []
  if (searchMovie.length === 0 && lastSearchMovie.length === 0) {
    data = movies
  } else if (searchMovie.length === 0 && lastSearchMovie.length !== 0) {
    data = lastSearchMovie
  } else {
    data = searchMovie
  }

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  // amount => amount of movies
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //產生每頁的電影
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li >
    `
  }
  pagination.innerHTML = rawHTML
}

//監聽分頁欄
pagination.addEventListener('click', function onPaginatorClicked(e) {
  //如果點擊的不是 <a>，結束
  if (e.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  // const page = Number(e.target.dataset.page)
  //得到當前頁數
  currentPage = Number(e.target.dataset.page)

  //更新畫面
  renderMovieList(getMoviesByPage(currentPage))
})

function changeMode(mode) {
  if (dataPanel.dataset.mode === mode) {
    return
  }
  dataPanel.dataset.mode = mode
}

//監聽切換
changeListCard.addEventListener('click', function switchClick(e) {
  if (e.target.matches('.fa-th')) {
    //render card
    changeMode('card')
  } else if (e.target.matches('.fa-bars')) {
    //render list
    changeMode('list')
  }

  renderMovieList(getMoviesByPage(currentPage))
})



axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage)) //只要第一頁
  })
  .catch((err) => console.log(err))