class SlideStories {
  constructor(id) {
    this.slide = document.querySelector(`[data-slide=${id}]`);
    this.active = 0;
    this.thumb = this.slide.querySelector(".slide-thumb");
    this.init();
    this.modal = this.slide.querySelector(".modal");

    document.addEventListener("keydown", this.handleArrowKeys.bind(this));

    const buttons = this.slide.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          event.preventDefault();
        }
      });
    });
  }

  handleArrowKeys(event) {
    if (event.key === "ArrowLeft") {
      this.prev();
    } else if (event.key === "ArrowRight") {
      this.next();
    }
  }

  activeSlide(index) {
    this.active = index;
    const isLastSlide = index === this.items.length - 1;
    //shows modal on last slide

    if (this.modal && this.modal.classList.contains("active")) {
      this.modal.classList.remove("active");
    }

    isLastSlide && this.showLastSlideModal();

    this.items.forEach((item, idx) => {
      item.classList.toggle("active", idx === index);
      if (idx === index) {
        if (item.tagName === "VIDEO") {
          item.autoplay = true;
          item.currentTime = 0;
          item.play().catch((error) => {
            console.log("Autoplay failed:", error);
          });
        }
      } else {
        if (item.tagName === "VIDEO") {
          item.autoplay = false;
          item.pause();
        }
      }
    });
    this.thumbItems.forEach((item, idx) => {
      item.classList.toggle("active", idx === index);
    });
    this.autoSlide();
  }

  prev() {
    if (this.active > 0) {
      this.activeSlide(this.active - 1);
    }
  }

  next() {
    if (this.active < this.items.length - 1) {
      this.activeSlide(this.active + 1);
    }
  }

  addNavigation() {
    const nextBtn = this.slide.querySelector(".slide-next");
    const prevBtn = this.slide.querySelector(".slide-prev");
    nextBtn.addEventListener("click", this.next.bind(this));
    prevBtn.addEventListener("click", this.prev.bind(this));
  }

  addThumbItem() {
    const thumbItem = document.createElement("span");
    const track = document.createElement("span");
    track.classList.add("track");
    thumbItem.append(track);
    this.thumb.appendChild(thumbItem);
    this.thumbItems.push(thumbItem);

    thumbItem.addEventListener("click", () => {
      this.activeSlide(this.thumbItems.indexOf(thumbItem));
    });
  }

  addThumbItems() {
    this.thumbItems = [];
    this.items.forEach((item, index) => this.addThumbItem(index));
  }

  autoSlide() {
    clearTimeout(this.timeout);
    const activeItem = this.items[this.active];
    const arr = [...this.items];
    const isLastSlide = arr.indexOf(activeItem) === arr.length - 1;

    if (activeItem.tagName === "VIDEO" && activeItem.classList.contains("active")) {
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), activeItem.duration * 1000);
      this.animateThumb(activeItem.duration);
    } else {
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), 5000);
    }
  }

  animateThumb(duration) {
    const thumbActive = this.thumb.querySelector(".active");
    const track = thumbActive.querySelector(".track");
    if (thumbActive) {
      track.style.animationDuration = `${duration}s`;

      setTimeout(() => {
        track.style.animationDuration = "";
      }, duration * 1000);
    }
  }

  playVideo() {
    const activeItem = this.items[this.active];
    if (activeItem.tagName === "VIDEO" && activeItem.paused) {
      activeItem.play().catch((error) => {
        console.log("Autoplay failed:", error);
      });
    }
  }

  stopVideo() {
    const videos = this.slide.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  }

  appendStory(story) {
    const slideItems = this.slide.querySelector(".slide-items");

    if (story.type === "image") {
      const imageElement = document.createElement("img");
      imageElement.src = story.src;
      imageElement.alt = `Image ${this.items.length + 1}`;
      slideItems.appendChild(imageElement);
    } else if (story.type === "video") {
      const videoElement = document.createElement("video");
      const source = document.createElement("source");
      source.src = story.src;

      videoElement.autoplay = true;

      videoElement.append(source);
      slideItems.appendChild(videoElement);
    }

    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItem();
  }

  showLastSlideModal() {
    const lastSlideIndex = this.items.length - 1;

    if (this.active === lastSlideIndex) {
      this.modal.classList.add("active");

      const modalForm = this.modal.querySelector(".modal-form");

      modalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const modalInput = this.modal.querySelector("#modal-input");
        const userInput = modalInput.value;
        console.log("User input:", userInput);
        this.modal.classList.remove("active");
      });
    }
  }

  init() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItems();

    const stories = [
      {
        type: "image",
        src: "./assets/images/pexels-photo-799443.jpeg",
      },
      {
        type: "image",
        src: "./assets/images/pexels-todd-trapani-1535162.jpg",
      },
      {
        type: "video",
        src: "./assets/video/5922551.mp4",
      },
      {
        type: "video",
        src: "./assets/video/133640 (720p).mp4",
      },
    ];

    stories.forEach((story) => this.appendStory(story));

    this.activeSlide(0);

    this.addNavigation();
  }
}

new SlideStories("slide");
