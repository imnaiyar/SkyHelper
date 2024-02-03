module.exports = (interaction, fieldsData, unixTime, offset, timezone) => {
  return {
    Content: `<html data-theme="light">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:type" content="website">
<meta property="og:url" content="https://skyhelper.xyz">
<meta property="og:title" content="SkyHelper | SkyCoTL Shards, Guides, Events">
<meta property="og:description" content="SkyHelper is a versatile Discord bot designed to enhance the <a href= 'https://thatskygame.com'>Sky: Children of the Light</a> gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky.">
<meta property="og:image" content="https://media.discordapp.net/attachments/867638574571323424/1154914225001607178/IMG_3581_cropped_2.png">
    <title>SkyHelper</title>
    <link rel="icon" href="assets/img/skybot.png">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="stylesheet" href="assets/css/bulma.min.css" />
    <link rel="stylesheet" href="assets/css/style.css" />
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/tippy.js@6/animations/scale.css"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
      integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    
     <style>
        /* Define CSS styles for the code block */
        .cmd {
    background-color: #0F0F10;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: lighter;
    padding: 2px 7px;
    border-radius: 5px;
        }
    .cmdCollapse {
    display: inline-block;
    margin: 5px;
    width: fit-content;
    border-radius: 5px;
    background-color: #525151;
    color: rgba(255, 255, 255, 0.8);
    padding: 5px 7px;
    overflow: hidden;
}

    .cm {
    background-color: #141617;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    font-weight: lighter;
    padding: 2px 7px;
    border-radius: 5px;
        }
      </style>

    <script src="assets/js/jquery-3.6.0.js"></script>
  </head>
    <body>
      <!-- Back To Top Start -->
    <a id="backtotop" data-tippy-content="Back To Top.">
      <i class="fa-solid fa-angle-up has-text-white fa-2xl mt-5"></i>
    </a>
    <!-- Back To Top End -->

    <!-- Navbar Start -->
    <nav
      class="navbar is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand mt-2 mb-2">
        <a class="navbar-item" href="/">
                      <img src="assets/img/skybot.png"/> 
    <style>img {
  margin-right: 10px;
}</style>
          <div class="word text-xl font-bold text"> 
     <span>S</span> 
     <span>k</span> 
     <span>y</span> 
     <span>H</span> 
     <span>e</span> 
     <span>l</span> 
     <span>p</span> 
     <span>e</span>
     <span>r</span>
   </div> 

          <!-- or if you want to use image -->
        </a>
                <button
    type="button"
    class= "material-symbols-outlined"
    data-theme-toggle
  >dark_mode</button>

        <a
          role="button"
          class="navbar-burger has-text-white"
          data-target="navMenu"
          aria-label="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-start">
          <a href="/" class="navbar-item is-tab">
            Home
          </a>

          <a href="/#features" class="navbar-item is-tab">
            Features
          </a>

          <a href="/#stats" class="navbar-item is-tab">
            Stats
          </a>

          <a href="https://docs.skyhelper.xyz" class="navbar-item is-tab">
            Commads
          </a>
        </div>

        <div class="navbar-end">
          <a href="https://discord.gg/u9zUjWbbQ4" class="navbar-item is-tab" target="_blank">
            <i class="fa-brands fa-discord"></i>
          </a>

          <a href="https://github.com/imnaiyar/SkyHelper.git" class="navbar-item is-tab" target="_blank">
            <i class="fa-brands fa-github"></i>
          </a>

          <div class="navbar-item">
            <div class="buttons">
              <a href="https://discord.gg/u9zUjWbbQ4" class="button is-blurple">
                <strong
                  ><i class="fa-solid fa-right-to-bracket mr-2"></i>
                  Support Server</strong
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <!-- Navbar End -->
    <section id="unix" class="section mt-6">
     <div class="has-text-centered">
      <h2><b>Unix Timestamp for ${interaction.user.username}</b></h2>
      <div class="line line-center blurple"></div>
      <br>
     <span class ="cmdCollapse">
     Provided Time: <span id="formattedTimestamp"></span><br>
     Offset: <span class="cm">${offset}</span>
     </span>
      <br>
      <br>
       ${fieldsData
         .map(
           (field, index) => `
  <div>
    <h2>● ${field.name} (e.g, <span class ="discUnix">${field.example}</span>)</h2>
    <span class="cmd">${sanitizeField(field.value)}</span>
    <button class="copyBtn" onclick="copyText(${index}, this)">Copy</button>
  </div>
  <br>
`
         )
         .join("")}
<script>
  function copyText(index, button) {
    const cmdSpan = document.querySelectorAll('.cmd')[index];
    const text = cmdSpan.textContent;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Change the button text to 'Copied'
    button.textContent = 'Copied';
    
    // Set a timeout to revert the button text after 1 second
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  }
</script>
</div>
</section>
    <footer class="footer bg-base">
      <div class="content has-text-centered has-text-white">
        <div class="mb-2">
          <a href="https://discord.gg/u9zUjWbbQ4" class="has-text-white" target="_blank">
            <i class="fa-brands fa-discord"></i>
          </a>
          &nbsp; &nbsp;
          <a href="https://github.com/imnaiyar/SkyHelper.git" class="has-text-white" target="_blank">
            <i class="fa-brands fa-github"></i>
          </a>
        </div>

        <p>
          <span class="has-text-weight-bold">[SkyHelper]</span>
          <br />
          &copy; <span id="cp-year"></span> Copyright NyR. All Rights
          Reserved. Our <a
            href="/privacy"
            class="blurple has-text-weight-bold"
            target="_blank"
            >Privacy Policy</a
          > and <a
            href="/tos"
            class="blurple has-text-weight-bold"
            target="_blank"
            >Terms and Conditions</a
          >.
        </p>
      </div>
    </footer>
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/tippy.js@6"></script>
    <script src="assets/js/script.js"></script>
    </body>
    </html>`,
  };
};

function sanitizeField(value) {
  return value.replace(/`/g, "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
