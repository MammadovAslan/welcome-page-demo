class SlideStories {
  constructor(id) {
    this.slide = document.querySelector(`[data-slide=${id}]`);
    this.active = 0;
    this.thumb = this.slide.querySelector(".slide-thumb");
    this.init();
    this.modal = this.slide.querySelector(".modal");
    this.isRegistered = false;
    this.isTouching = false;

    this.slide.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
    this.slide.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
    this.slide.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    this.slide.addEventListener("touchstart", () => {
      this.isTouching = true;
      setTimeout(() => (this.isTouching = false), 200);
    });
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

  handleTouchStart(event) {
    if (!this.isTouching) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  handleTouchMove(event) {
    if (!this.isTouching) {
      event.preventDefault();
      this.touchEndX = event.touches[0].clientX;
      this.touchEndY = event.touches[0].clientY;
    }
  }

  handleTouchEnd(event) {
    if (!this.isTouching) {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;

      const touchThreshold = 50;

      if (Math.abs(deltaX) > touchThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.prev();
        } else {
          this.next();
        }
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
    //shows modal on the last slide

    if (this.modal && this.modal.classList.contains("active")) {
      this.modal.classList.remove("active");
      //remove modal if the user swipes from the last slide backward
    }

    isLastSlide && this.showLastSlideModal();

    this.items.forEach((item, idx) => {
      item.classList.toggle("active", idx === index);
      const child = item.firstChild;
      if (idx === index) {
        if (child.tagName === "VIDEO") {
          if (!child.paused) {
            // If the video is already playing, do nothing
            return;
          }
          child.autoplay = true;
          child.currentTime = 0;
          child.playsInline = true;
          child.muted = true;
          const playPromise = child.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Autoplay started successfully
              })
              .catch((error) => {
                // Autoplay failed, but this catch block will handle it, so no need to console log it again
              });
          }
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
      item.classList.toggle("seen", idx < index);
    });
    this.autoSlide();
  }

  prev() {
    if (this.active > 0) {
      console.log("run");
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

    // Assign an index-related class to each thumb item

    this.thumb.appendChild(thumbItem);
    this.thumbItems.push(thumbItem);

    // switch slide by clicking on thumb
    thumbItem.addEventListener("click", () => {
      this.activeSlide(this.thumbItems.indexOf(thumbItem));
    });
  }

  addThumbItems() {
    this.thumbItems = [];
    this.items.forEach((item, index) => this.addThumbItem());
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
      const duration = 5;
      this.animateThumb(duration);
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), duration * 1000);
    }
  }

  //*animate thumb track according to slide media type
  animateThumb(duration) {
    const thumbActive = this.thumb.querySelector(".active");
    const track = thumbActive.querySelector(".track");
    if (thumbActive) {
      track.style.animationDuration = `${duration}s`;

      setTimeout(() => {
        // track.style.animationDuration = "";
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
      source.type = "video/mp4";

      // videoElement.autoplay = true;
      videoElement.allowsInlineMediaPlayback = true;
      videoElement.setAttribute("playsinline", "true");

      videoElement.append(source);
      slideContainer.append(videoElement);
    }
    const text = document.createElement("div");
    text.classList.add("slide-text");

    const contentText = document.createElement("p");
    contentText.innerHTML = story.content;
    const title = document.createElement("h3");
    title.innerHTML = story.title;

    text.appendChild(title);
    text.append(contentText);

    slideContainer.append(text);
    slideItems.append(slideContainer);

    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItem();
  }

  appendLastSlide(story) {
    const slideItems = this.slide.querySelector(".slide-items");
    const slideContainer = document.createElement("div");
    slideContainer.classList.add("slide-container");

    if (story.type === "image") {
      const image = document.createElement("img");
      image.src = story.src;
      slideContainer.append(image);
    } else if (story.type === "video") {
      const video = document.createElement("video");
      const source = document.createElement("source");
      source.src = story.src;
      video.append(source);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      slideContainer.appendChild(canvas);

      slideContainer.append(video);
    }

    slideItems.append(slideContainer);

    this.items = this.slide.querySelectorAll(".slide-items > *");
    this.addThumbItem();
  }

  //*shows modal window on last slide
  showLastSlideModal() {
    const lastSlideIndex = this.items.length - 1;

    if (this.active === lastSlideIndex && !this.isRegistered) {
      this.modal.classList.add("active");

      const modalForm = this.modal.querySelector(".modal-form");
      const successModal = this.createModalElement(
        "success-modal",
        `
        <div class="info-modal-content">
          <img src="./assets/icons/smile.png" alt="Cool" />
          <h2>Поздравляем!</h2>
          <p>Вы успешно присоединились к FANZOONE</p>
            <a href="#" class="store-link">
          <img src="./assets/icons/google.png" alt="Cool" />
          </a>
          <a href="#" class="store-link">
            <img src="./assets/icons/apple.png" alt="Cool" />
          </a>
          <button id="close-modal-btn">Закрыть</button>
        </div>
        `
      );

      const errorModal = this.createModalElement(
        "error-modal",
        `
        <p>Упс! что-то пошло не так :(</p>
      `
      );

      // Check if event listeners are already added
      if (!modalForm.hasAttribute("data-event-listeners-added")) {
        modalForm.setAttribute("data-event-listeners-added", "true");

        modalForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const errorMessage = modalForm.querySelector(".error-message");

          const modalInput = this.modal.querySelector("#modal-input");
          const userInput = modalInput.value;

          try {
            console.log("User input:", userInput);
            const isValidNumber = this.validatePhoneNumber(userInput.replaceAll(" ", ""));
            //check phone number validation
            if (!isValidNumber) {
              errorMessage.style.opacity = 1;
            } else {
              this.modal.classList.remove("active");
              this.slide.appendChild(successModal);
              this.isRegistered = true;
              const closeModalButton = successModal.querySelector("#close-modal-btn");

              closeModalButton.addEventListener("click", () => {
                successModal.remove();
              });
            }
          } catch (error) {
            // Show error modal
            console.log(error);
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
  }

  validatePhoneNumber(string) {
    const regEx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    return regEx.test(string);
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
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
      {
        type: "image",
        src: "./assets/images/pexels-todd-trapani-1535162.jpg",
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
      {
        type: "video",
        src: "./assets/video/5922551.mp4",
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
      {
        type: "video",
        src: "./assets/video/133640 (720p).mp4",
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
      // {
      //   type: "video",
      //   src: "./assets/video/production_id_4057150 (2160p).mp4",
      //   title: "Title",
      //   content: "Lorem ipsum dolor sit amet",
      // },
    ];

    stories.forEach((story) => this.appendStory(story));

    this.appendLastSlide(stories[stories.length - 1]);

    this.activeSlide(0);

    this.addNavigation();
  }
}

new SlideStories("slide");
