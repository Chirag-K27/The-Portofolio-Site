//toggle icon-Navbar

let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

//Scroll Sections

let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
  sections.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 100;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");

    if (top >= offset && top <= offset + height) {
      // active navbar links
      navLinks.forEach((links) => {
        links.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
      // active section for animation on scroll
      sec.classList.add("show-animate");
    }
    // if want to use animation that repeats on scroll use this
    else {
      sec.classList.remove("show-animate");
    }
  });
  // sticky header
  let header = document.querySelector("header");

  header.classList.toggle("sticky", window.scrollY > 100);

  // remove toggle icon and navbar when clicks navbar links(scroll)
  menuIcon.classList.remove("bx-x");
  navbar.classList.remove("active");

  // animation footer on scroll
  let footer = document.querySelector("footer");

  footer.classList.toggle(
    "show-animate",
    this.scrollY + this.innerHeight >= footer.offsetTop - 200
  );
};

const backendUrl = process.env.BACKEND_URL;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  let responseMessage = document.getElementById("response-message");
  if (!responseMessage) {
    responseMessage = document.createElement("p");
    responseMessage.id = "response-message";
    responseMessage.style.textAlign = "center";
    responseMessage.style.marginTop = "10px";
    responseMessage.style.fontSize = "16px";
    form.appendChild(responseMessage);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
    const message = document.getElementById("message").value;

    try {
      const response = await fetch(`${backendUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, message }),
      });

      const data = await response.json();
      if (response.ok) {
        responseMessage.textContent =
          data.success || "Message sent successfully!";
        responseMessage.style.color = "#9ACD32";
      } else {
        responseMessage.textContent = data.error || "Error sending message!";
        responseMessage.style.color = "red";
      }
    } catch (error) {
      responseMessage.textContent = "Error sending message. Try again later.";
      responseMessage.style.color = "red";
    }
  });
});

// Project Popup Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get all project cards
  const projectCards = document.querySelectorAll(".project-card");

  // Add click event to each card
  projectCards.forEach((card) => {
    card.addEventListener("click", function () {
      const projectId = this.getAttribute("data-project");
      const popup = document.getElementById(`${projectId}-popup`);

      if (popup) {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden"; // Prevent scrolling while popup is open
      }
    });
  });

  // Close popup when close button is clicked
  const closeButtons = document.querySelectorAll(".close-popup");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const popup = this.closest(".project-popup-overlay");
      popup.style.display = "none";
      document.body.style.overflow = "auto"; // Re-enable scrolling
    });
  });

  // Close popup when clicking outside the content
  const popups = document.querySelectorAll(".project-popup-overlay");
  popups.forEach((popup) => {
    popup.addEventListener("click", function (e) {
      if (e.target === this) {
        popup.style.display = "none";
        document.body.style.overflow = "auto"; // Re-enable scrolling
      }
    });
  });

  // Close popup when Escape key is pressed
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const openPopup = document.querySelector(
        '.project-popup-overlay[style="display: flex;"]'
      );
      if (openPopup) {
        openPopup.style.display = "none";
        document.body.style.overflow = "auto"; // Re-enable scrolling
      }
    }
  });
});

// Enhanced popup handling to properly disable scrolling
const openPopup = (popup) => {
  // Store current scroll position
  const scrollY = window.scrollY;

  // Apply fixed position to body at current scroll position
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  // Show popup
  popup.style.display = "flex";
};

const closePopup = (popup) => {
  // Get the body's top position
  const scrollY = document.body.style.top;

  // Reset body position
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.overflow = "auto";

  // Restore scroll position
  window.scrollTo(0, parseInt(scrollY || "0") * -1);

  // Hide popup
  popup.style.display = "none";
};

document.addEventListener("DOMContentLoaded", function () {
  const projectCards = document.querySelectorAll(".project-card");
  const popups = document.querySelectorAll(".project-popup-overlay");
  const closeButtons = document.querySelectorAll(".close-popup");

  projectCards.forEach((card) => {
    card.addEventListener("click", function () {
      const projectId = this.getAttribute("data-project");
      const popup = document.getElementById(`${projectId}-popup`);

      if (popup) {
        openPopup(popup);
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const popup = this.closest(".project-popup-overlay");
      closePopup(popup);
    });
  });

  popups.forEach((popup) => {
    popup.addEventListener("click", function (e) {
      if (e.target === this) {
        closePopup(popup);
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const openPopup = document.querySelector(
        ".project-popup-overlay[style='display: flex;']"
      );
      if (openPopup) {
        closePopup(openPopup);
      }
    }
  });
});
