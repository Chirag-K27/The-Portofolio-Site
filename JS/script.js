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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  // Check if the response message element already exists
  let responseMessage = document.getElementById("response-message");
  if (!responseMessage) {
    responseMessage = document.createElement("p"); // Create the message element
    responseMessage.id = "response-message";
    responseMessage.style.textAlign = "center";
    responseMessage.style.marginTop = "10px";
    responseMessage.style.fontSize = "16px";
    form.appendChild(responseMessage); // Append below the form
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
    const message = document.getElementById("message").value;

    try {
      const response = await fetch("http://localhost:3001/contact", {
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


function expandProject(element) {
  document.getElementById("project-title").innerText = element.getAttribute("data-title");
  document.getElementById("project-company").innerText = element.getAttribute("data-company");
  document.getElementById("project-date").innerText = element.getAttribute("data-date");
  document.getElementById("project-desc").innerText = element.getAttribute("data-desc");
  document.getElementById("project-tech").innerText = element.getAttribute("data-tech");
  document.getElementById("project-role").innerText = element.getAttribute("data-role");

  document.getElementById("project-detail").classList.add("active");
}

function closeProject() {
  document.getElementById("project-detail").classList.remove("active");
};
