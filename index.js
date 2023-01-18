// Variables

let pageNo = 0;
let searchResultsPageNo = 0;
let searchQuery;
let viewportWidth = window.innerWidth;
let callingFromSearchPage = false;
const nightMode = document.getElementById("night-mode");
const dayMode = document.getElementById("day-mode");
const searchBarIcon = document.querySelector(".search-bar i");
const searchBarInput = document.querySelector(".search-bar input");
const preLoader = document.getElementById("loading");
const rootElement = document.querySelector(":root");

// Fromating server returned date as our needed format
const formatDate = (inputDate) => {
  // Desired Date Format
  const format = { year: "numeric", month: "long", day: "numeric" };
  // If you want to convert a date into your desired format, you must initialize the process by converting that date to ISO Date Format first.
  const ISODateFormat = new Date(inputDate);

  // Now convert the ISO Date Format into your desired Date Format using the toLocaleDateString() function, where 1st argument is the Locale Parameter and 2nd argument is your desired format.
  const output = ISODateFormat.toLocaleDateString("en-GB", format);

  return output;
};

const addToDOM = (datum) => {
  const imgContainer = document.createElement("div");
  imgContainer.innerHTML = `
      <div class="img">
          <img src="${datum.urls.regular}" alt="" />
          <div class="hover-info">
            <div class="photographer-info-group">
              <div class="photographer-info">
                <img
                  src="${datum.user.profile_image.medium}"
                  alt=""
                  class="profile-photo"
                />
                <div class="info-group">
                  <p class="name">${datum.user.name}</p>
                  <p><small>${datum.user.location}</small></p>
                </div>
              </div>
              <div class="btn">
                <i class="fa-duotone fa-user-plus"></i>
                <p>Follow</p>
              </div>
            </div>
            <div class="additional-info">
              <div class="like-info">
                <p>Total Likes</p>
                <p><small>${datum.likes}</small></p>
              </div>
              <div class="upload-info">
                <p>Uploaded On</p>
                <p><small>${formatDate(datum.created_at)}</small></p>
              </div>
            </div>
            <div class="action-buttons">
              <div class="btn like-btn">
                <i class="fa-duotone fa-square-heart"></i>
                <p>Like</p>
              </div>
              <a class="btn download-btn" id="download-btn" downloadUrl="${
                datum.urls.raw
              }" fileName="${datum.id}.png">
                <i class="fa-duotone fa-download"></i>
                <p>Download</p>
              </a>
            </div>
          </div>
        </div>`;

  const width = datum.width;
  const height = datum.height;
  const ratio = (width / height).toFixed(2);

  // Determining Photo Category (Normal/Vertical/Horizontal/Big)
  // if ratio = 0 - 0.69 -> Vertical
  // if ratio = 0.70 - 1 -> Normal
  // if ratio = 1.01 - 1.50 -> Horizontal
  // if ratio = > 1.50 -> Big

  if (ratio < 0.69) {
    imgContainer.classList.add("vertical");
  } else if (ratio > 1.0 && ratio < 1.5) {
    imgContainer.classList.add("horizontal");
  } else if (ratio > 1.5) {
    imgContainer.classList.add("big");
  }
  document.querySelector("main").appendChild(imgContainer);

  const downloadButtons = document.querySelectorAll(".download-btn");
  downloadButtons.forEach((downloadButton) => {
    downloadButton.addEventListener("click", (e) => {
      const downloadUrl = e.currentTarget.attributes.downloadurl.nodeValue;
      const fileName = e.currentTarget.attributes.filename.nodeValue;
      download(downloadUrl, fileName);
    });
  });
};

const getPhotos = () => {
  pageNo = pageNo + 1;
  fetch(
    `https://api.unsplash.com/photos/?client_id=mt12h-JJbdtTg-RrzINE8IoZO54YibKeaReEKtS8HXg&per_page=30&page=${pageNo}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.map((datum) => {
        addToDOM(datum);
      });
    });
};

// Getting initial photos for Homepage
getPhotos();

const download = async (url, filename) => {
  // Showing a popup to let the user that the download process is started in background
  const messagePopUp = document.getElementById("popup-message");
  messagePopUp.innerHTML = "";
  messagePopUp.innerHTML = `<p>Starting Download</p>`;
  messagePopUp.style.opacity = 1;
  messagePopUp.style.bottom = "1rem";
  setTimeout(() => {
    messagePopUp.style.opacity = 0;
    messagePopUp.style.bottom = "-4rem";
  }, 1500);

  // Initializing the download process
  const data = await fetch(url);
  const blob = await data.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Creating an invisible element which will automatically trigger the download process
  const link = document.createElement("a");

  link.setAttribute("href", objectUrl);
  link.setAttribute("download", filename);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Showing a popup to confirm the user that the download process was successfull
  messagePopUp.innerHTML = "";
  messagePopUp.innerHTML = `<p>Thanks for downloading</p>`;
  messagePopUp.style.opacity = 1;
  messagePopUp.style.bottom = "1rem";
  setTimeout(() => {
    messagePopUp.style.opacity = 0;
    messagePopUp.style.bottom = "-4rem";
  }, 2000);
};

// Infinite Scroll

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  let infiniteScrollStartCondition;

  if (viewportWidth > 500) {
    infiniteScrollStartCondition = scrollTop + clientHeight >= scrollHeight;
  } else {
    infiniteScrollStartCondition =
      scrollTop + clientHeight >= scrollHeight - 200;
  }

  if (infiniteScrollStartCondition) {
    console.log(callingFromSearchPage);
    if (callingFromSearchPage) {
      preLoader.innerHTML = `<span class="loader"></span>
<p>Getting more search results ...</p>`;
      preLoader.style.width = "max-content";
      preLoader.style.height = "100%";
      preLoader.style.display = "block";
      preLoader.style.margin = "0 auto";
      document.getElementById("loading").style.display = "block";
      setTimeout(() => {
        searchPhotos(searchQuery);
      }, 1000);
    } else {
      console.log("object");
      preLoader.innerHTML = `<span class="loader"></span>
<p>Getting more photos ...</p>`;
      preLoader.style.width = "max-content";
      preLoader.style.height = "100%";
      preLoader.style.display = "block";
      preLoader.style.margin = "0 auto";
      document.getElementById("loading").style.display = "block";
      getPhotos();
    }
  }
});

// Theme Mode

nightMode.addEventListener("click", () => {
  nightMode.style.bottom = "3.2rem";
  dayMode.style.bottom = "3.2rem";

  rootElement.style.setProperty("--primary-bg-color", "hsl(213, 25%, 10%)");
  rootElement.style.setProperty("--primary-text-color", "hsl(213, 25%, 95%)");
  rootElement.style.setProperty("--light-bg-color", "hsl(213, 25%, 20%)");
});

dayMode.addEventListener("click", () => {
  dayMode.style.bottom = "0";
  nightMode.style.bottom = "0";

  rootElement.style.setProperty("--primary-text-color", "hsl(213, 25%, 15%)");
  rootElement.style.setProperty("--primary-bg-color", "hsl(0, 0%, 100%)");
  rootElement.style.setProperty("--light-bg-color", "hsl(0, 25%, 95%)");
});

// Search Bar Functionality
const searchPhotos = (searchQuery) => {
  searchResultsPageNo = searchResultsPageNo + 1;
  fetch(
    `https://api.unsplash.com/search/photos/?query=${searchQuery}&per_page=30&page=${searchResultsPageNo}`,
    {
      method: "GET",
      headers: {
        Authorization: "Client-ID mt12h-JJbdtTg-RrzINE8IoZO54YibKeaReEKtS8HXg",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      data.results.map((datum) => {
        addToDOM(datum);
      });
    })
    .catch((error) => console.log(error));
};

// post search click jobs

const searchResultsPagePreparation = () => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  preLoader.innerHTML = `<span class="loader"></span>
  <p>Getting search results ...</p>`;
  preLoader.style.width = "100%";
  preLoader.style.height = "75vh";
  preLoader.style.display = "flex";
  preLoader.style.flexDirection = "column";
  preLoader.style.alignItems = "center";
  preLoader.style.justifyContent = "center";
  preLoader.style.margin = "0";
};
const loadSearchResults = () => {
  searchQuery = searchBarInput.value;
  searchResultsPagePreparation();

  setTimeout(() => {
    searchPhotos(searchQuery);
    preLoader.style.display = "none";
  }, 1000);
  callingFromSearchPage = true;
};

searchBarIcon.addEventListener("click", loadSearchResults());

searchBarInput.addEventListener("keypress", (event) => {
  if (event.code === "Enter") {
    loadSearchResults();
  }
});

if (viewportWidth <= 778) {
  const searchPopup = document.querySelector(".search-bar-overlay");

  searchBarIcon.removeEventListener("click", loadSearchResults());

  searchBarIcon.addEventListener("click", () => {
    searchPopup.style.display = "block";
  });
  document.getElementById("close-btn").addEventListener("click", () => {
    searchPopup.style.display = "none";
  });

  const searchInput = document.querySelector(
    ".search-bar-overlay .search-bar-popup .search-bar input"
  );
  const searchBtn = document.querySelector(
    ".search-bar-overlay .search-bar-popup .search-bar i"
  );

  searchBtn.addEventListener("click", () => {
    searchPopup.style.display = "none";
    loadSearchResults();
  });
}
