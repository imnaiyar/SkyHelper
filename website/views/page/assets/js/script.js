// tippy.js
tippy("[data-tippy-content]");

// aos.js
AOS.init({
  duration: 700,
  once: true
});
// Bot's name animation
const spans = document.querySelectorAll(".word span"); 
  
     spans.forEach((span, idx) => { 
       span.addEventListener("click", (e) => { 
         e.target.classList.add("active"); 
       }); 
       span.addEventListener("animationend", (e) => { 
         e.target.classList.remove("active"); 
       }); 
  
       setTimeout(() => { 
         span.classList.add("active"); 
       }, 750 * (idx + 1)); 
     }); 

// navbar burger
document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }
});

$(document).ready(function() {
  $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
  });
});

// navbar on scroll
$(function () {
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 700) {
      $("nav").addClass("nav-w");
      $(".navbar-menu").addClass("nav-w");
      $(".navbar-item").addClass("nav-dark");
      $(".navbar-link").addClass("nav-dark");
      $(".navbar-burger").removeClass("has-text-white");
      $(".navbar-burger").addClass("has-text-dark");
    } else {
      $("nav").removeClass("nav-w");
      $(".navbar-menu").removeClass("nav-w");
      $(".navbar-item").removeClass("nav-dark");
      $(".navbar-link").removeClass("nav-dark");
      $(".navbar-burger").removeClass("has-text-dark");
      $(".navbar-burger").addClass("has-text-white");
    }
  });
});

// back to top
var btn = $("#backtotop");

$(window).scroll(function () {
  if ($(window).scrollTop() > 100) {
    btn.addClass("show");
  } else {
    btn.removeClass("show");
  }
});

btn.on("click", function (e) {
  e.preventDefault();
  $("html, body").animate({ scrollTop: 0 }, "300");
});

// copyright year
document.getElementById("cp-year").innerHTML = new Date().getFullYear()

// footer handling
window.addEventListener('load', adjustFooterPosition);
window.addEventListener('resize', adjustFooterPosition);

function adjustFooterPosition() {
  const bodyHeight = document.body.offsetHeight;
  const windowHeight = window.innerHeight;
  const footer = document.querySelector('.footer');

  if (bodyHeight < windowHeight) {
    footer.style.position = 'fixed';
    footer.style.bottom = 0;
    footer.style.width = "100vw";
  }
}