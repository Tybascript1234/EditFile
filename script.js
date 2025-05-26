// ------------------------------------------------------------------------------------------------





// ------------------------------------------------------------------------------------------------





// // repply

// window.addEventListener("load", function () {
//     setTimeout(() => {
//         // تأكد من أنه لا توجد رسائل JavaScript قبل تنفيذ الموجة
//         if (!window.alertOpen) {
//             initializeWaveButtons();
//         }
//     }, 100); // تأخير بسيط للتأكد من تحميل العناصر

//     function initializeWaveButtons() {
//         const elements = document.querySelectorAll('.wave-button');

//         elements.forEach(element => {
//             let isRippleActive = false;

//             function createRipple(e) {
//                 if (isRippleActive) return;

//                 isRippleActive = true;

//                 const ripple = document.createElement('span');
//                 const rect = element.getBoundingClientRect();
//                 const size = Math.max(rect.width, rect.height);

//                 let x, y;
//                 if (e.clientX && e.clientY) {
//                     x = e.clientX - rect.left - size / 2;
//                     y = e.clientY - rect.top - size / 2;
//                 } else if (e.touches && e.touches[0]) {
//                     x = e.touches[0].clientX - rect.left - size / 2;
//                     y = e.touches[0].clientY - rect.top - size / 2;
//                 }

//                 ripple.style.width = ripple.style.height = `${size}px`;
//                 ripple.style.left = `${x}px`;
//                 ripple.style.top = `${y}px`;
//                 ripple.classList.add('ripple');

//                 element.appendChild(ripple);

//                 setTimeout(() => {
//                     ripple.remove();
//                     isRippleActive = false;
//                 }, 600);
//             }

//             element.addEventListener('mousedown', createRipple);
//             element.addEventListener('touchstart', createRipple);
//         });
//     }
// });


// ---------------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', function () {
    const toggleBtns = [document.getElementById('btn1')];
    const toggleDivs = [document.getElementById('div1')];
  
    toggleBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', function(event) {
          event.stopPropagation();
          const targetId = btn.getAttribute('data-target');
          const targetDiv = document.getElementById(targetId);
  
          if (targetDiv) {
            toggleDivs.forEach(div => {
              if (div && div !== targetDiv) {
                div.style.display = 'none';
              }
            });
  
            targetDiv.style.display = targetDiv.style.display === 'block' ? 'none' : 'block';
          } else {
            console.error(`الـ div مع الـ id "${targetId}" غير موجود.`);
          }
        });
      }
    });
  
    document.addEventListener('click', function() {
      toggleDivs.forEach(div => {
        if (div) {
          div.style.display = 'none';
        }
      });
    });
  });  

// --------------------------------------------------------------------------------------------------------



document.addEventListener("DOMContentLoaded", function () {
  const codars = document.querySelectorAll(".codar");
  const toggleButtons = document.querySelectorAll(".toggleBtn");

  if (!codars.length || !toggleButtons.length) return;

  function checkScreenSize() {
    codars.forEach((codar) => {
      const shouldBeClosed = codar.getAttribute("data-initial") === "closed";
      if (window.innerWidth <= 800 || shouldBeClosed) {
        codar.style.width = "0px";
        codar.style.opacity = "0";
        codar.style.borderLeft = "0px";
      } else {
        codar.style.width = "240px";
        codar.style.opacity = "1";
        codar.style.borderLeft =
          window.innerWidth <= 800 ? "0px" : "solid 1px #ededed";
      }
    });
  }

  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = btn.getAttribute("data-target");
      const codar = document.getElementById(targetId);
      if (!codar) return;

      if (codar.style.width === "0px") {
        codar.style.width = "240px";
        codar.style.opacity = "1";
        codar.style.borderLeft =
          window.innerWidth <= 800 ? "0px" : "solid 1px #ededed";
      } else {
        codar.style.width = "0px";
        codar.style.opacity = "0";
        codar.style.borderLeft = "0px";
      }
    });
  });

  function hideCodarsIfClickedOutside(event) {
    if (window.innerWidth <= 800) {
      codars.forEach((codar, i) => {
        const toggleBtn = toggleButtons[i];
        if (!codar.contains(event.target) && event.target !== toggleBtn) {
          codar.style.width = "0px";
          codar.style.opacity = "0";
          codar.style.borderLeft = "0px";
        }
      });
    }
  }

  document.addEventListener("touchstart", hideCodarsIfClickedOutside);
  document.addEventListener("click", hideCodarsIfClickedOutside);
});

  


document.addEventListener("DOMContentLoaded", function () {
    const messageInputs = document.querySelectorAll(".message-input");

    messageInputs.forEach(messageInput => {
        function updatePlaceholder() {
            if (messageInput.textContent.trim() === "") {
                messageInput.setAttribute("data-placeholder", "اكتب رسالتك هنا...");
            } else {
                messageInput.setAttribute("data-placeholder", "");
            }
        }

        messageInput.addEventListener("input", updatePlaceholder);
        messageInput.addEventListener("blur", updatePlaceholder);
    });
});

setInterval(() => {
    const filesSection = document.getElementById("filesSection");
    const x0xDiv = document.querySelector(".x0x");

    if (filesSection && x0xDiv) {
        x0xDiv.style.display = (filesSection.style.display === "none") ? "none" : "block";
    }
}, 0); // التحقق كل نصف ثانية

document.addEventListener("DOMContentLoaded", function () {
  const messageInput = document.getElementById("messageInput");
  const filesSection = document.getElementById("filesSection");

  if (messageInput && filesSection) {
    messageInput.addEventListener("input", () => {
      messageInput.style.height = "auto";

      const textHeight = messageInput.scrollHeight;
      const isEmpty = messageInput.textContent.trim() === "";
      const newHeight = isEmpty
        ? 21.5
        : Math.min(Math.max(21.5, textHeight), 168);

      messageInput.style.height = newHeight + "px";

      let marginBottom;
      if (isEmpty) {
        marginBottom = 66;
      } else {
        const heightDifference = newHeight - 21.5;
        marginBottom = 66 + heightDifference * (146 / 147);
        marginBottom = Math.min(213, marginBottom);
      }

      filesSection.style.marginBottom = marginBottom + "px";
    });
  } else {
    console.error("الـ div أو textarea غير موجودين.");
  }
});


document.addEventListener('DOMContentLoaded', function () {
document.querySelectorAll('.Wave-cloud').forEach(btn => {
  let ripple = null;

  const create = (e) => {
    if (ripple) return;

    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 0.5;

    // دعم إحداثيات اللمس
    let clientX = e.clientX,
      clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    ripple = Object.assign(document.createElement("span"), {
      className: "ripple",
      style: `width:${s}px;height:${s}px;left:${
        clientX - r.left - s / 2
      }px;top:${clientY - r.top - s / 2}px`,
    });

    btn.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add("expand"));
  };

  const release = () => {
    if (!ripple) return;
    const current = ripple;
    ripple = null;
    setTimeout(() => {
      current.classList.add('fade-out');
      current.addEventListener('transitionend', () => {
        if (current.parentNode) current.remove();
      }, { once: true });
    }, 400);
  };

  ['mousedown','touchstart'].forEach(e => btn.addEventListener(e, create));
  ['mouseup','touchend','mouseleave','touchcancel'].forEach(e => btn.addEventListener(e, release));
});

});

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("toggleBtn234");
  const div1 = document.getElementById("div1");
  const scriptSrc = "https://tybascript1234.github.io/Languag/embed.js";

  function toggleContent(show) {
    if (show) {
      const script = Object.assign(document.createElement("script"), {
        src: scriptSrc,
        id: "dynamicScript",
      });
      const targetDiv = Object.assign(document.createElement("div"), {
        id: "target-container",
      });
      div1.append(script, targetDiv);
    } else {
      ["dynamicScript", "target-container"].forEach((id) =>
        document.getElementById(id)?.remove()
      );
    }
    btn.innerHTML = show
      ? '<icon style="background-image: url(Icon/remove.svg);animation: online 0.3s;"></icon>'
      : '<icon style="background-image: url(Icon/add.svg);animation: online 0.3s;"></icon>';
    localStorage.setItem("contentShown", show);
  }

  btn.onclick = (e) => {
    e.stopPropagation(); // تأكد أن النقر لا يتسرب
    const newState = localStorage.getItem("contentShown") !== "true";
    toggleContent(newState);
    // الرسائل تظهر فقط عند النقر على الزر
    if (newState) {
      alert("تم تفعيل الترجمة ");
    } else {
      alert("تم إلغاء الترجمة");
    }
  };

  // منع أي تأثير للنقر داخل div1
  div1.onclick = (e) => {
    e.stopPropagation(); // لا تفعل شيئًا عند النقر على div1
  };

  window.onload = () =>
    toggleContent(localStorage.getItem("contentShown") === "true");
  
});
