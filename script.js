// ------------------------------------------------------------------------------------------------





// ------------------------------------------------------------------------------------------------





// repply

window.addEventListener("load", function () {
    setTimeout(() => {
        // تأكد من أنه لا توجد رسائل JavaScript قبل تنفيذ الموجة
        if (!window.alertOpen) {
            initializeWaveButtons();
        }
    }, 100); // تأخير بسيط للتأكد من تحميل العناصر

    function initializeWaveButtons() {
        const elements = document.querySelectorAll('.wave-button');

        elements.forEach(element => {
            let isRippleActive = false;

            function createRipple(e) {
                if (isRippleActive) return;

                isRippleActive = true;

                const ripple = document.createElement('span');
                const rect = element.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                let x, y;
                if (e.clientX && e.clientY) {
                    x = e.clientX - rect.left - size / 2;
                    y = e.clientY - rect.top - size / 2;
                } else if (e.touches && e.touches[0]) {
                    x = e.touches[0].clientX - rect.left - size / 2;
                    y = e.touches[0].clientY - rect.top - size / 2;
                }

                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.classList.add('ripple');

                element.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                    isRippleActive = false;
                }, 600);
            }

            element.addEventListener('mousedown', createRipple);
            element.addEventListener('touchstart', createRipple);
        });
    }
});


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



document.addEventListener('DOMContentLoaded', function () {
    const codar = document.getElementById("codar");
    const toggleBtn = document.getElementById("toggleBtn");
  
    if (!codar || !toggleBtn) return; // إيقاف التنفيذ إذا لم يوجد أحد العنصرين
  
    function checkScreenSize() {
        if (window.innerWidth <= 800) {
            codar.style.width = "0px";
        } else {
            codar.style.width = "240px";
        }
    }
  
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
  
    toggleBtn.addEventListener("click", function () {
        if (codar.style.width === "0px") {
            codar.style.width = "240px";
        } else {
            codar.style.width = "0px";
        }
    });
  
    document.addEventListener("touchstart", function (event) {
        if (window.innerWidth <= 800) {
            if (!codar.contains(event.target) && event.target !== toggleBtn) {
                codar.style.width = "0px";
            }
        }
    });
  
    document.addEventListener("click", function (event) {
        if (window.innerWidth <= 800) {
            if (!codar.contains(event.target) && event.target !== toggleBtn) {
                codar.style.width = "0px";
            }
        }
    });
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

window.onload = function() {
    const messageInput = document.getElementById("messageInput");
    const filesSection = document.getElementById("filesSection");

    if (messageInput && filesSection) {
        messageInput.addEventListener("input", () => {
            // إعادة تعيين الارتفاع إلى 'auto' لحساب scrollHeight بدقة
            messageInput.style.height = 'auto';
            
            // حساب الارتفاع الجديد
            const textHeight = messageInput.scrollHeight;
            const isEmpty = messageInput.textContent.trim() === "";
            const newHeight = isEmpty ? 21.5 : Math.min(Math.max(21.5, textHeight), 168);
            
            messageInput.style.height = newHeight + "px";

            // حساب الهامش السفلي
            let marginBottom;
            if (isEmpty) {
                marginBottom = 66;
            } else {
                const heightDifference = newHeight - 21.5;
                marginBottom = 66 + (heightDifference * (146 / 147));
                marginBottom = Math.min(213, marginBottom);
            }
            
            filesSection.style.marginBottom = marginBottom + "px";
        });
    } else {
        console.error("الـ div أو textarea غير موجودين.");
    }
};