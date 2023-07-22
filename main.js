class SlideStories {
  constructor(id) {
    this.slide = document.querySelector(`[data-slide=${id}]`);
    this.active = 0;
    this.thumb = this.slide.querySelector(".slide-thumb");
    this.init();
    this.modal = this.slide.querySelector(".modal");

    document.addEventListener("keydown", this.handleArrowKeys.bind(this));
    this.slide.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
    this.slide.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
    this.slide.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    const buttons = this.slide.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("keydown", (event) => {
        if (event.key === " ") {
          event.preventDefault();
        }
      });
    });
  }

  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling while swiping
    this.touchEndX = event.touches[0].clientX;
    this.touchEndY = event.touches[0].clientY;
  }

  handleTouchEnd(event) {
    // Calculate swipe direction and distance
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    // Check if horizontal swipe distance is larger than vertical swipe distance
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        this.prev(); // Swipe right, go to previous slide
      } else {
        this.next(); // Swipe left, go to next slide
      }
    }
  }

  //*swipe slides with keyboard keys
  handleArrowKeys(event) {
    if (event.key === "ArrowLeft") {
      this.prev();
    } else if (event.key === "ArrowRight") {
      this.next();
    }
  }

  //*set active slide
  activeSlide(index) {
    this.active = index;
    const isLastSlide = index === this.items.length - 1;
    //shows modal on last slide

    if (this.modal && this.modal.classList.contains("active")) {
      this.modal.classList.remove("active");
      //remove modal if user swipes from last slide backwards
    }

    isLastSlide && this.showLastSlideModal();

    this.items.forEach((item, idx) => {
      item.classList.toggle("active", idx === index);
      const child = item.firstChild;
      if (idx === index) {
        if (child.tagName === "VIDEO") {
          child.autoplay = true;
          child.currentTime = 0;
          child.play().catch((error) => {
            console.log("Autoplay failed:", error);
          });
        }
      } else {
        if (child.tagName === "VIDEO") {
          child.autoplay = false;
          child.pause();
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

  //*swipe slides by slicking on left/right side of slide
  addNavigation() {
    const nextBtn = this.slide.querySelector(".slide-next");
    const prevBtn = this.slide.querySelector(".slide-prev");
    nextBtn.addEventListener("click", this.next.bind(this));
    prevBtn.addEventListener("click", this.prev.bind(this));
  }

  //*adding thumbs at the top
  addThumbItem() {
    const thumbItem = document.createElement("span");
    const track = document.createElement("span");
    track.classList.add("track");
    thumbItem.append(track);
    this.thumb.appendChild(thumbItem);
    this.thumbItems.push(thumbItem);

    //switch slide by clicking on thumb
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
    const activeItem = this.items[this.active].firstChild;
    const arr = [...this.items];
    const isLastSlide = arr.indexOf(activeItem) === arr.length - 1;

    //if slide item is vedio, it will stay visible untill the end of the video
    if (activeItem.tagName === "VIDEO" && activeItem.parentElement.classList.contains("active")) {
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), activeItem.duration * 1000);
      this.animateThumb(activeItem.duration);
    } else {
      //in case of image it will stay active for 5s
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), 5000);
    }
  }

  //*animate thumb track according to slide media type
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

  //*append story depending of media type
  appendStory(story) {
    const slideItems = this.slide.querySelector(".slide-items");
    const slideContainer = document.createElement("div");
    slideContainer.classList.add("slide-container");

    if (story.type === "image") {
      const imageElement = document.createElement("img");
      imageElement.src = story.src;
      imageElement.alt = `Image ${this.items.length + 1}`;
      slideContainer.append(imageElement);
    } else if (story.type === "video") {
      const videoElement = document.createElement("video");
      const source = document.createElement("source");
      source.src = story.src;

      videoElement.autoplay = true;
      videoElement.playsinline = true;
      // videoElement.muted = 'muted';

      videoElement.append(source);
      slideContainer.append(videoElement);
    }
    const text = document.createElement("p");
    text.classList.add("slide-text");
    text.innerHTML = story.text;
    slideContainer.append(text);
    slideItems.append(slideContainer);

    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItem();
  }

  closeModal() {
    const successModal = this.slide.querySelector(".success-modal");
    if (successModal) {
      successModal.remove();
    }
  }

  //*shows modal window on last slide
  showLastSlideModal() {
    const lastSlideIndex = this.items.length - 1;

    if (this.active === lastSlideIndex) {
      this.modal.classList.add("active");

      const modalForm = this.modal.querySelector(".modal-form");
      const successModal = this.createModalElement(
        "success-modal",
        `
        <img src="./assets/icons/smile.png" alt="Cool" />
        <h2>Позлравляем!</h2>
        <p>Вы успешно присоедилились к FANZOONE</p>
        <a href="#" class="store-link">
          <img src="./assets/icons/google.png" alt="Cool" />
        </a>
        <a href="#" class="store-link">
          <img src="./assets/icons/apple.png" alt="Cool" />
        </a>
        <button id="close-modal-btn">Закрыть</button>

      `
      );

      const errorModal = this.createModalElement(
        "error-modal",
        `
        <p>Упс! что-то пошло не так :(</p>
      `
      );

      modalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const modalInput = this.modal.querySelector("#modal-input");
        const userInput = modalInput.value;

        try {
          console.log("User input:", userInput);

          //!use this code to test error handling on submit
          if (userInput.length < 8) {
            throw Error();
          }

          this.modal.classList.remove("active");
          this.slide.appendChild(successModal);
          const closeModalButton = successModal.querySelector("#close-modal-btn");
          closeModalButton.addEventListener("click", () => {
            this.closeModal();
          });
          // this.modal.classList.remove("active");
        } catch (error) {
          // Show error modal
          this.modal.classList.remove("active");
          this.slide.appendChild(errorModal);

          setTimeout(() => {
            errorModal.remove();
            this.modal.classList.add("active");
            modalForm.reset();
          }, 2000);
        }
      });
    }
  }

  createModalElement(className, innerHTML) {
    const modalElement = document.createElement("div");
    modalElement.classList.add(className);
    modalElement.innerHTML = innerHTML;
    return modalElement;
  }

  //*initialize storyline(simulation of backend-data)
  init() {
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItems();

    const stories = [
      {
        type: "image",
        src: "./assets/images/pexels-photo-799443.jpeg",
        text: "Lorem ipsum sacramentum noto narum nefarius",
      },
      {
        type: "image",
        src: "./assets/images/pexels-todd-trapani-1535162.jpg",
        text: "Lorem ipsum sacramentum noto narum nefarius",
      },
      {
        type: "video",
        src: "./assets/video/5922551.mp4",
        text: "Lorem ipsum sacramentum noto narum nefarius",
      },
      {
        type: "video",
        src: "./assets/video/133640 (720p).mp4",
        text: "Lorem ipsum sacramentum noto narum nefarius",
      },
    ];

    stories.forEach((story) => this.appendStory(story));

    this.activeSlide(0);

    this.addNavigation();
  }
}

new SlideStories("slide");
