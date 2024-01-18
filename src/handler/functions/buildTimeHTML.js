module.exports = (interaction, fieldsData, offset, timezone, providedTime) => {
  return `
  <!DOCTYPE html>



    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!--=============== FAVICON ===============-->
        <link rel="shortcut icon" href="/assets/img/boticon.png" type="image/x-icon">

        <!--=============== BOXICONS ===============-->
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
        
        <!--=============== SWIPER CSS ===============-->
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css">

        <!--=============== CSS ===============-->
        <link rel="stylesheet" href="/assets/css/styles.css">

        <title>Timestamp - SkyHelper</title>
    </head>
    <body>
            <!--==================== HEADER ====================-->

        <header class="header" id="header">

            <nav class="nav container">
              <a href="/" class="nav__logo">
                <img src="/assets/img/boticon.png" style="top: 50px; left: 50px; widht: 40px; height: 40px;"> <p class="nav__logo-text">SkyHelper</p>
              </a>
              <a href="/" class="nav__link">

                      <i class='bx bx-home-alt-2'></i>
                      <span>Home</span>
                      </a>
              
              <!-- Theme change button -->
              <i class='bx bx-moon change-theme' id="theme-button"></i>
                    <a href="/commands" class="nav__link">
                      <i class='bx bx-code-alt com-icon'></i><p class="nav__com">Commands</p>
                    </a>
              <a href="https://discord.com/invite/u9zUjWbbQ4" class="button nav__button">
                Invite Me
              </a>
            </nav>
        </header>
      
      <!-- Content -->
           <main class="main">
         <section class="home section" id="home">
            <div class="home__container container grid">
               <div class="home__data">
                  <h1 class="home__title">
                     Timestamp
                  </h1>
               </div>
            </div>
         </section>

      </main>
      
      <!-- timestamp -->
      <section class="value section" id="value">
            <div class="value__container container times__data">
                     <h2 class="section__title">
                        Timestamp for <img src="${interaction.user.displayAvatarURL()}" style="width:25px;height:25px;border-radius:50%;"><span>  ${
                          interaction.user.username
                        }</span>
                     </h2>
                      <div class="alert alert-info">Provided Time: ${providedTime}<br>Offset: <strong>${offset}</strong>
                      </div>
                      <div class="value__accordion-item2">
                    ${fieldsData
                      .map(
                        (field, index) => `
                      
                  <div class="time__header">
                        <strong>${field.name} (<span class="discUnix">${
                          field.example
                        }</span>)</strong></div>
                        
                        <br> <span class="code-block">${sanitizeField(
                          field.value,
                        )}</span> <button class="copyBtn">
      <span><svg class ="copySvg" viewBox="0 0 467 512.22" clip-rule="evenodd" fill-rule="evenodd" image-rendering="optimizeQuality" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" xmlns="http://www.w3.org/2000/svg" height="12" width="12"><path d="M131.07 372.11c.37 1 .57 2.08.57 3.2 0 1.13-.2 2.21-.57 3.21v75.91c0 10.74 4.41 20.53 11.5 27.62s16.87 11.49 27.62 11.49h239.02c10.75 0 20.53-4.4 27.62-11.49s11.49-16.88 11.49-27.62V152.42c0-10.55-4.21-20.15-11.02-27.18l-.47-.43c-7.09-7.09-16.87-11.5-27.62-11.5H170.19c-10.75 0-20.53 4.41-27.62 11.5s-11.5 16.87-11.5 27.61v219.69zm-18.67 12.54H57.23c-15.82 0-30.1-6.58-40.45-17.11C6.41 356.97 0 342.4 0 326.52V57.79c0-15.86 6.5-30.3 16.97-40.78l.04-.04C27.51 6.49 41.94 0 57.79 0h243.63c15.87 0 30.3 6.51 40.77 16.98l.03.03c10.48 10.48 16.99 24.93 16.99 40.78v36.85h50c15.9 0 30.36 6.5 40.82 16.96l.54.58c10.15 10.44 16.43 24.66 16.43 40.24v302.01c0 15.9-6.5 30.36-16.96 40.82-10.47 10.47-24.93 16.97-40.83 16.97H170.19c-15.9 0-30.35-6.5-40.82-16.97-10.47-10.46-16.97-24.92-16.97-40.82v-69.78zM340.54 94.64V57.79c0-10.74-4.41-20.53-11.5-27.63-7.09-7.08-16.86-11.48-27.62-11.48H57.79c-10.78 0-20.56 4.38-27.62 11.45l-.04.04c-7.06 7.06-11.45 16.84-11.45 27.62v268.73c0 10.86 4.34 20.79 11.38 27.97 6.95 7.07 16.54 11.49 27.17 11.49h55.17V152.42c0-15.9 6.5-30.35 16.97-40.82 10.47-10.47 24.92-16.96 40.82-16.96h170.35z" fill-rule="nonzero"></path></svg> Copy</span>
      <span>Copied</span>
    </button>
                        <br><br>`,
                      )
                      .join('')}
                        
                      </div>
            </div>
         </section>
  <!--==================== FOOTER ====================-->



        <footer class="footer section">

            <div class="footer__container container grid">
              <div>
                <a href="#" class="footer__logo">
                  <img src="/assets/img/boticon.png" style="top: 50px; left: 50px; widht: 20px; height: 20px;"> SkyHelper
                </a>
                <p class="footer__description">
                  A discord bot for the game Sky: Children of the Light
                </p>
              </div>
              <div class="footer__content">
                <div>
                  <h3 class="footer__title">
                    About
                  </h3>
                  <ul class="footer__links">
                    <li>
                      <a href="/" class="footer__link">About Me</a>
                      </li>
                    
                    <li>

                      <a href="/#popular" class="footer__link">Features</a>

                    </li>
                    <li>

                      <a href="https://docs.skyhelper.xyz" class="footer__link">Documentation</a>

                    </li>
                  </ul>
                </div>
                <div>

                  <h3 class="footer__title">

                    Support
                  </h3>
                  <ul class="footer__links">
                    <li>
                      <a href="/#value" class="footer__link">FAQs</a>
                    </li>
                    <li>

                      <a href="https://discord.com/invite/u9zUjWbbQ4" class="footer__link">Support Server</a>

                    </li>
                    <li>

                      <a href="/contact-us" class="footer__link">Contact Us</a>

                    </li>
                  </ul>
                </div>
                <div>

                  <h3 class="footer__title">

                    Socials
                  </h3>
                  <ul class="footer__social">
                    <a href="https://github.com/imnaiyar/SkyHelper" target="_blank" class="footer__social-link">
                      <i class='bx bxl-github'></i>
                    </a>
                    <a href="https://discord.com/invite/u9zUjWbbQ4" target="_blank" class="footer__social-link">
                      <i class='bx bxl-discord' ></i>
                    </a>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="footer__info container">
              <span class="footer__copy">
                &#169; SkyHelper. All rights reserved
              </span>
              
              <div class="footer__privacy">
                <a href="/tos">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
              </div>
            </div>
        </footer>


        <!--========== SCROLL UP ==========-->
        <a href="#" class="scrollup" id="scroll-up">
          <i class='bx bx-chevrons-up' ></i>
        </a>

        <!--=============== SCROLLREVEAL ===============-->
        <script src="/assets/js/scrollreveal.min.js"></script>

        <!--=============== SWIPER JS ===============-->
        <script src="/assets/js/swiper-bundle.min.js"></script>

        <!--=============== MAIN JS ===============-->
        <script src="/assets/js/main.js"></script>
    </body>
</html>
  `;
};

function sanitizeField(value) {
  // Remove backticks, <, and > characters
  return value.replace(/`/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
