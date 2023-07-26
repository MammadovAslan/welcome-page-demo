class SlideStories {
  constructor(id) {
    this.slide = document.querySelector(`[data-slide=${id}]`);
    this.active = 0;
    this.thumb = this.slide.querySelector(".slide-thumb");
    this.init();
    this.modal = this.slide.querySelector(".modal");

    this.isRegistered = false;
    this.isTouching = false;
    this.submitDelayed = false;
    this.intervalID = null;
    this.loading = false;
    this.slide.addEventListener("touchstart", this.handleTouchStart.bind(this), false);
    this.slide.addEventListener("touchmove", this.handleTouchMove.bind(this), false);
    this.slide.addEventListener("touchend", this.handleTouchEnd.bind(this), false);
    this.slide.addEventListener("touchstart", () => {
      this.isTouching = true;
      setTimeout(() => (this.isTouching = false), 150);
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

    if (this.modal && this.modal.classList.contains("active")) {
      this.modal.classList.remove("active");
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

          let isLoaded = false;

          const loadedMetadataHandler = () => {
            isLoaded = true;
            child.removeEventListener("loadedmetadata", loadedMetadataHandler);

            const playPromise = child.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Autoplay started successfully
                })
                .catch((error) => {
                  console.log("Error during autoplay:", error);
                });
            }
          };

          child.addEventListener("loadedmetadata", loadedMetadataHandler);
          setTimeout(() => {
            if (!isLoaded) {
              child.play().catch((error) => {
                console.log("Error during autoplay:", error);
              });
            }
          }, 100);
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

  async autoSlide() {
    clearTimeout(this.timeout);
    const activeItem = this.items[this.active].firstChild;
    const arr = [...this.items];
    const isLastSlide = arr.indexOf(activeItem) === arr.length - 1;

    if (activeItem.tagName === "VIDEO" && activeItem.parentElement.classList.contains("active")) {
      if (!activeItem.duration) {
        await new Promise((resolve) => {
          activeItem.addEventListener("loadedmetadata", resolve);
        });
      }

      try {
        await activeItem.play();
        this.timeout = !isLastSlide && setTimeout(this.next.bind(this), activeItem.duration * 1000);
      } catch (error) {
        this.items[this.active].addEventListener("click", () => {
          this.activeSlide(this.active);
        });
      }

      this.animateThumb(activeItem);
    } else {
      const duration = 5;
      this.animateThumb(duration);
      this.timeout = !isLastSlide && setTimeout(this.next.bind(this), duration * 1000);
    }
  }

  //*animate thumb track according to slide media type
  animateThumb(value) {
    const thumbActive = this.thumb.querySelector(".active");
    const track = thumbActive.querySelector(".track");
    track.style.transform = "translateX(-100%)";
    track.style.transition = "0s linear";

    if (typeof value !== "number") {
      value.load();
    } else {
      track.style.animationName = "";
    }

    if (thumbActive) {
      clearInterval(this.intervalID);
      this.intervalID = setInterval(() => {
        //images are simply animated

        if (typeof value === "number") {
          track.style.animation = `thumb ${value - 0.5}s linear forwards`;
        } else {
          //video thumb track will be represent the actual playtime of the video,
          //if it freeze in case of bad connection, the track will also stop
          const duration = value.duration;
          const buffered = value.buffered;
          track.style.transition = "0.5s linear";

          if (buffered.length > 0) {
            const played = value.currentTime;
            const percents = parseInt((played * 100) / duration);

            track.style.transform = `translateX(${percents - 100}%)`;
          } else {
            track.style.transform = `translateX(-100%)`;
            value.currentTime = 0;
          }
        }
      }, 500);
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

  muteButton() {
    //<i class="fa-solid fa-volume-xmark"></i>
    const icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-volume-xmark");
  }

  //*shows modal window on last slide
  showLastSlideModal() {
    const lastSlideIndex = this.items.length - 1;

    if (this.active === lastSlideIndex && !this.isRegistered) {
      this.modal.classList.add("active");

      const modalForm = this.modal.querySelector(".modal-form");
      const codeModal = this.createModalElement(
        "code-modal",
        `
        <form class="code-form">
        <img src="./assets/icons/smile.png" alt="Cool" />
          <h2>Подтвердите код</h2>
          <p>Вам поступит звонок-сброс с уникального номера.
          Введите последние 4 цифры этого номера
          </p>
          <div class='code-inputs'>
            <input type="text" maxlength="1" / placeholder=".">
            <input type="text" maxlength="1" / placeholder=".">
            <input type="text" maxlength="1" / placeholder=".">
            <input type="text" maxlength="1" / placeholder=".">
          </div>
          <button id="modal-submit">Отправить</button>
        </form>
      `
      );

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
        <div class="error-modal-content">
        <img src="./assets/icons/sadsmile.svg" alt="Cool" />
          <h2>О-оу, что-то не так!</h2>
          <p>Проверьте номер телефона и повторите попытку</p>
        </div>
      `
      );

      // Check if event listeners are already added
      if (!modalForm.hasAttribute("data-event-listeners-added")) {
        modalForm.setAttribute("data-event-listeners-added", "true");

        modalForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          const errorMessage = modalForm.querySelector(".error-message");
          const modalButton = modalForm.querySelector("#modal-submit");
          const modalInput = this.modal.querySelector("#modal-input");
          const userInput = modalInput.value;

          try {
            this.loading = true;
            console.log("User input:", userInput);
            const isValidNumber = this.validatePhoneNumber(userInput.replaceAll(" ", ""));
            //check phone number validation

            //! await for the response

            if (userInput === "1111") {
              throw new Error("global error test");
            }

            if (!isValidNumber) {
              errorMessage.style.opacity = 1;
            } else {
              this.modal.classList.remove("active");
              this.slide.appendChild(codeModal);

              const inputs = codeModal.querySelectorAll("input");
              const codeForm = codeModal.querySelector(".code-form");

              //4 code digit input logic
              this.fillCodeInput(inputs);

              //submiting user 4 digit code
              codeForm.addEventListener("submit", (e) => {
                e.preventDefault();

                const userCode = [...inputs].reduce((acc, cur) => {
                  return acc + cur.value;
                }, "");

                if (!this.submitDelayed) {
                  try {
                    //!test for wrong code
                    if (userCode === "1111") {
                      throw new Error("1111 - wrong code test");
                    }

                    if (userCode.length === 4) {
                      console.log(userCode);
                      codeModal.remove();
                      this.slide.appendChild(successModal);

                      this.isRegistered = true;
                      const closeModalButton = successModal.querySelector("#close-modal-btn");

                      closeModalButton.addEventListener("click", () => {
                        successModal.remove();
                      });
                    }
                  } catch (error) {
                    this.wrongCodeError(codeForm);
                    console.error(error);
                  }
                }
              });
            }
          } catch (error) {
            this.showGlobalErrorModal(error, errorModal);
          }
        });
      }
    }
  }

  showGlobalErrorModal(error, modal) {
    console.error(error);
    this.modal.classList.remove("active");
    this.slide.appendChild(modal);

    setTimeout(() => {
      modal.remove();
      this.modal.classList.add("active");
      this.modal.querySelector(".modal-form").reset();
    }, 3000);
  }

  wrongCodeError(parent) {
    //set modal content to 'wrong code'
    const submitButton = parent.querySelector("#modal-submit");
    const inputs = parent.querySelectorAll("input");
    submitButton.classList.add("hide");
    const img = parent.querySelector("img");
    const title = parent.querySelector("h2");
    const message = parent.querySelector("p");

    inputs.forEach((input) => {
      input.classList.add("wrong-code");
    });

    message.innerHTML =
      "Вы ввели неверный код. По истечению таймера вы сможете запросить код повторно";
    img.src = "./assets/icons/sadsmile.svg";
    title.innerHTML = "Неверный код";

    this.submitDelayed = true;
    const timer = this.createTimer(15 * 1000, () => {
      const makeNewCallButton = this.recallButton();

      parent.append(makeNewCallButton);
      this.submitDelayed = false;
      timer.remove();
    });

    parent.append(timer);
  }

  fillCodeInput(inputs) {
    inputs.forEach((input, key) => {
      if (key === 0) input.focus();
      input.addEventListener("keyup", function (e) {
        if (e.key === "Backspace") {
          input.value = "";
          inputs[key - 1] && inputs[key - 1].focus();
        }

        if (input.value.replace(/[^\d.-]+/g, "")) {
          input.value = input.value.replace(/[^\d.-]+/g, "");

          key !== 3 && inputs[key + 1].focus();
        } else {
          input.value = "";
        }
      });
    });
  }

  makeCall() {
    //send new 4 digit code to user
    const codeModal = document.querySelector(".code-modal");
    const submitButton = codeModal.querySelector("#modal-submit");
    const inputs = codeModal.querySelectorAll("input");
    const callButton = codeModal.querySelector(".call-button");

    //reseting modal content
    const message = codeModal.querySelector("p");
    const img = codeModal.querySelector("img");
    const title = codeModal.querySelector("h2");

    message.innerHTML =
      "Вам поступит звонок-сброс с уникального номера. Введите последние 4 цифры этого номера";
    img.src = "./assets/icons/smile.png";
    title.innerHTML = "Подтвердите код";

    submitButton.classList.remove("hide");
    inputs.forEach((input) => {
      input.classList.remove("wrong-code");
      input.value = "";
    });
    callButton.remove();
    console.log("Bot will call soon");
  }

  loadingSpinner() {
    const spinner = document.createElement("div");
    const span = document.createElement("span");
    spinner.classList.add("lds-dual-ring");
    spinner.append(span);
    document.body.append(spinner);
  }

  removeLoading() {
    const spinner = document.querySelector(".lds-dual-ring");
    spinner.remove();
  }

  recallButton() {
    const button = document.createElement("button");
    button.classList.add("call-button");
    button.setAttribute("type", "button");
    button.innerHTML = "Позвонить повторно";
    button.addEventListener("click", this.makeCall.bind(this));

    return button;
  }

  createTimer(milliseconds, onTimerFinish) {
    const timerContainer = document.createElement("div");
    const timerText = document.createElement("div");
    timerContainer.appendChild(timerText);

    // Function to format time as mm:ss
    function formatTime(milliseconds) {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
      return `До повторной попытки <span class="timer"> ${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}</span>`;
    }

    let remainingTime = milliseconds;
    timerText.innerHTML = formatTime(remainingTime);

    const timerInterval = setInterval(() => {
      remainingTime -= 1000;

      if (remainingTime >= 0) {
        timerText.innerHTML = formatTime(remainingTime);
      } else {
        clearInterval(timerInterval);
        timerContainer.style.display = "none";
        onTimerFinish(); // Call the callback function when the timer finishes
      }
    }, 1000);

    return timerContainer;
  }

  validatePhoneNumber(string) {
    const regEx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    const isValidLength = string.length >= 8 && string.length <= 16;

    return regEx.test(string) && isValidLength;
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
        type: "video",
        src: "./assets/video/fanzoone-2_1.mp4",
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
        type: "image",
        src: "./assets/images/pexels-photo-799443.avif",
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
      {
        type: "image",
        src: "./assets/images/pexels-todd-trapani-1535162.avif",
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
        src: "./assets/video/133640-(720p).mp4",
        title: "Title",
        content: "Lorem ipsum dolor sit amet",
      },
    ];

    stories.forEach((story) => this.appendStory(story));

    this.appendLastSlide(stories[stories.length - 1]);

    this.activeSlide(0);

    this.addNavigation();
  }
}

new SlideStories("slide");
