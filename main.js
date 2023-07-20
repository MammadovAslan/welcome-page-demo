class SlideStories {
  constructor(id) {
    this.slide = document.querySelector(`[data-slide=${id}]`);
    this.active = 0;
    this.thumb = this.slide.querySelector(".slide-thumb");
    this.isInteracted = false;
    this.init();

    this.slide.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.slide.addEventListener("mouseup", this.handleMouseUp.bind(this));

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

  handleMouseDown() {
    const activeItem = this.items[this.active];
    if (activeItem.tagName === "VIDEO" && !activeItem.paused) {
      activeItem.pause();
    }
  }

  handleMouseUp() {
    const activeItem = this.items[this.active];
    if (activeItem.tagName === "VIDEO" && activeItem.paused) {
      activeItem.play().catch((error) => {
        console.log("Autoplay failed:", error);
      });
    }
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
    } else {
      this.activeSlide(this.items.length - 1);
    }
  }

  next() {
    if (this.active < this.items.length - 1) {
      this.activeSlide(this.active + 1);
    } else {
      this.activeSlide(0);
    }
  }

  addNavigation() {
    const nextBtn = this.slide.querySelector(".slide-next");
    const prevBtn = this.slide.querySelector(".slide-prev");
    nextBtn.addEventListener("click", this.next.bind(this));
    prevBtn.addEventListener("click", this.prev.bind(this));

    // Add a click event listener to the slide to track user interaction
    this.slide.addEventListener("click", () => {
      if (!this.isInteracted) {
        this.isInteracted = true;
        this.playVideo(); // Call playVideo() after user interaction
      }
    });
  }

  addThumbItem() {
    const thumbItem = document.createElement("span");
    const track = document.createElement("span");
    track.classList.add("track");
    thumbItem.append(track);
    this.thumb.appendChild(thumbItem);
    this.thumbItems.push(thumbItem);
  }

  addThumbItems() {
    this.thumbItems = [];
    this.items.forEach(() => this.addThumbItem());
  }

  autoSlide() {
    clearTimeout(this.timeout);
    const activeItem = this.items[this.active];

    if (activeItem.tagName === "VIDEO" && activeItem.classList.contains("active")) {
      this.timeout = setTimeout(this.next.bind(this), activeItem.duration * 1000);
      this.animateThumb(activeItem.duration); // Call the function to animate the thumb
    } else {
      this.timeout = setTimeout(this.next.bind(this), 5000);
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

  init() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItems();

    const stories = [
      {
        type: "image",
        src: "./assets/images/pexels-photo-799443.jpeg",
        duration: 5,
      },
      {
        type: "image",
        src: "./assets/images/pexels-todd-trapani-1535162.jpg",
        duration: 5,
      },
      {
        type: "video",
        src: "./assets/video/5922551.mp4",
        duration: 5,
      },
    ];

    stories.forEach((story) => this.appendStory(story));
    this.addNavigation();
    this.activeSlide(0);
  }
}

new SlideStories("slide");
