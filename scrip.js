let db;
let selectedItem;
let previousSelectedItemDiv = null;
let currentEditItem = null;
let mediaRecorder;
let audioChunks = [];

function initDB() {
    let request = indexedDB.open("FileManagerDB", 1);
    request.onupgradeneeded = function(event) {
        let db = event.target.result;
        if (!db.objectStoreNames.contains("items")) {
            db.createObjectStore("items", { keyPath: "name" });
        }
    };
    request.onsuccess = function(event) {
        db = event.target.result;
        renderItems();
    };
}

function showInputDiv(isEdit = false) {
    const inputDivTitle = document.getElementById("inputDivTitle");
    if (isEdit) {
        inputDivTitle.textContent = "تعديل المعلومات";
    } else {
        inputDivTitle.textContent = "إنشاء حاوية جديدة";
    }
    
    document.getElementById("overlayMessage").style.display = "none";
    document.getElementById("inputDiv").style.display = "block";
    document.getElementById("overlay").style.display = "block";
    document.getElementById("inputDiv").setAttribute("data-edit", isEdit);
}

function hideInputDiv() {
    currentEditItem = null;
    document.getElementById("inputDiv").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("nameInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("cancelPasswordButton").style.display = "none";
}

function createItem() {
    const nameInput = document.getElementById("nameInput");
    const passwordInput = document.getElementById("passwordInput");
    const inputDiv = document.getElementById("inputDiv");
    
    if (!nameInput || !passwordInput || !inputDiv) {
        console.error("Required elements not found");
        return;
    }

    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();
    const isEdit = inputDiv.getAttribute("data-edit") === "true";

    if (!name) {
        alert("Please enter a name");
        return;
    }

    const transaction = db.transaction(["items"], "readwrite");
    const store = transaction.objectStore("items");

    if (isEdit) {
        if (!currentEditItem) {
            console.error("No item selected for editing");
            return;
        }

        const getRequest = store.get(currentEditItem.name);
        
        getRequest.onsuccess = function() {
            const originalItem = getRequest.result;
            if (!originalItem) {
                alert("Original item not found in database");
                return;
            }

            const updatedItem = {
                name: name,
                password: password || null,
                files: originalItem.files
            };

            if (currentEditItem.name !== name) {
                store.delete(currentEditItem.name);
            }
            
            store.put(updatedItem);
            
            transaction.oncomplete = function() {
                if (selectedItem === currentEditItem.name) {
                    selectedItem = name;
                    localStorage.setItem('selectedItem', name);
                }
                
                renderItems();
                hideInputDiv();
                currentEditItem = null;
            };
        };
        
        getRequest.onerror = function() {
            console.error("Error retrieving item for editing");
        };
    } else {
        store.add({ name: name, password: password || null, files: [] });
        
        transaction.oncomplete = function() {
            nameInput.value = "";
            passwordInput.value = "";
            renderItems();
            hideInputDiv();

            setTimeout(() => {
                const itemsList = document.getElementById("itemsList");
                const newItemDiv = itemsList.querySelector('.item:first-child');
                if (newItemDiv) {
                    newItemDiv.querySelector('.wave-button').click();
                }
            }, 100);
        };
    }
}

function renderItems() {
    let transaction = db.transaction(["items"], "readonly");
    let store = transaction.objectStore("items");
    let request = store.getAll();
    request.onsuccess = function() {
        let itemsList = document.getElementById("itemsList");
        itemsList.innerHTML = "";
        let fragment = document.createDocumentFragment();
        let items = request.result;

        if (items.length === 0) {
            document.getElementById("filesSection").style.display = "none";
        }

        function processItems(startIndex) {
            const batchSize = 2;
            const endIndex = Math.min(startIndex + batchSize, items.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                let item = items[i];
                
                let div = document.createElement("div");
                div.classList.add("item");
            
                div.innerHTML = `
                    <div class="click wave-button">${item.name}</div>
                    <div class="item-buttons">
                        <button class="edit-button"><icon style="background-image: url(Icon/edit_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                        <button class="delete-button Wave-cloud"><icon style="background-image: url(Icon/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                    </div>
                `;
            
                let nameDiv = div.querySelector(".click");
                nameDiv.onclick = () => {
                    if (item.password) {
                        let enteredPassword = prompt("Enter password to view content:");
                        if (enteredPassword === item.password) {
                            showFiles(item.name);
                            highlightItem(div);
                        } else {
                            alert("Incorrect password!");
                            return;
                        }
                    } else {
                        showFiles(item.name);
                        highlightItem(div);
                    }
                };
            
                let deleteButton = div.querySelector(".delete-button");
                deleteButton.onclick = () => {
                    if (item.password) {
                        let enteredPassword = prompt("Enter password to delete:");
                        if (enteredPassword !== item.password) {
                            alert("Incorrect password!");
                            return;
                        }
                    }
                    if (confirm("هل أنت متأكد أنك تريد حذف هذا العنصر؟")) {
                        deleteItem(item.name);
                    }
                };
            
                let editButton = div.querySelector(".edit-button");
                editButton.onclick = () => showEditDiv(item);
            
                fragment.appendChild(div);
            
                if (item.name === localStorage.getItem('selectedItem')) {
                    highlightItem(div);
                    showFiles(item.name);
                }
            }
            

            itemsList.appendChild(fragment);

            if (endIndex < items.length) {
                setTimeout(() => processItems(endIndex), 0);
            }
        }

        processItems(0);
    };
}

function highlightItem(div) {
    if (previousSelectedItemDiv) {
        previousSelectedItemDiv.style.backgroundColor = "";
        previousSelectedItemDiv.style.color = "";
        previousSelectedItemDiv.style.fontWeight = "";
    }
    div.style.backgroundColor = "#c2e7ff";
    div.style.color = "#001d35";
    div.style.fontWeight = "600";
    previousSelectedItemDiv = div;

    localStorage.setItem('selectedItem', div.querySelector('.wave-button').textContent);
}

function deleteItem(name) {
    let transaction = db.transaction(["items"], "readwrite");
    let store = transaction.objectStore("items");
    store.delete(name);
    transaction.oncomplete = function() {
        if (localStorage.getItem('selectedItem') === name) {
            localStorage.removeItem('selectedItem');
        }

        let itemsList = document.getElementById("itemsList");
        let itemDivs = itemsList.getElementsByClassName("item");

        let nextItemDiv = null;

        for (let i = 0; i < itemDivs.length; i++) {
            if (itemDivs[i].querySelector('.wave-button').textContent !== name) {
                nextItemDiv = itemDivs[i];
                break;
            }
        }

        if (nextItemDiv) {
            let nextItemName = nextItemDiv.querySelector('.wave-button').textContent;

            let transaction = db.transaction(["items"], "readonly");
            let store = transaction.objectStore("items");
            let request = store.get(nextItemName);

            request.onsuccess = function() {
                let item = request.result;
                if (item.password) {
                    let enteredPassword = prompt("Enter password to view content:");
                    if (enteredPassword === item.password) {
                        showFiles(item.name);
                        highlightItem(nextItemDiv);
                    } else {
                        alert("Incorrect password!");
                        document.getElementById("filesSection").style.display = "none";
                        return;
                    }
                } else {
                    showFiles(item.name);
                    highlightItem(nextItemDiv);
                }
            };
        } else {
            document.getElementById("filesSection").style.display = "none";
        }

        renderItems();
    };
}

function showEditDiv(item) {
    if (!item) {
        console.error("Item is null or undefined");
        return;
    }

    if (item.password) {
        const enteredPassword = prompt("Enter password to edit:");
        if (enteredPassword !== item.password) {
            alert("Incorrect password!");
            return;
        }
    }
    
    currentEditItem = {...item};
    
    document.getElementById("nameInput").value = item.name;
    document.getElementById("passwordInput").value = item.password || "";
    showInputDiv(true);

    document.getElementById("cancelPasswordButton").style.display = item.password ? "block" : "none";
}

function cancelPassword() {
    if (currentEditItem) {
        document.getElementById("passwordInput").value = "";
        const cancelPasswordButton = document.getElementById("cancelPasswordButton");
        cancelPasswordButton.style.display = "none";
    }
}

function showFiles(name) {
    document.getElementById("currentName").textContent = name;
    document.getElementById("filesSection").style.display = "block";
    selectedItem = name;
    renderFiles();
}

function uploadFiles() {
    let fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0 && selectedItem) {
        let transaction = db.transaction(["items"], "readwrite");
        let store = transaction.objectStore("items");
        let request = store.get(selectedItem);

        request.onsuccess = function () {
            let item = request.result;
            let filesArray = [];

            if (item.files.length + fileInput.files.length > 20) {
                showOverlayMessage();
                return;
            }

            Array.from(fileInput.files).forEach((file, index) => {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let fileId = Date.now() + index;
                    filesArray.push({ id: fileId, name: file.name, url: e.target.result });

                    if (filesArray.length === fileInput.files.length) {
                        let updateTransaction = db.transaction(["items"], "readwrite");
                        let updateStore = updateTransaction.objectStore("items");
                        item.files = item.files.concat(filesArray);
                        updateStore.put(item);
                        updateTransaction.oncomplete = function () {
                            renderFiles(filesArray);
                            updateProgressBar(item.files.length);
                        };
                    }
                };
                reader.readAsDataURL(file);
            });
        };
    }
}

function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = function() {
                let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                let fileId = Date.now();
                let fileName = `Recording_${fileId}.wav`;
                let fileUrl = URL.createObjectURL(audioBlob);

                let transaction = db.transaction(["items"], "readwrite");
                let store = transaction.objectStore("items");
                let request = store.get(selectedItem);

                request.onsuccess = function () {
                    let item = request.result;
                    if (item.files.length >= 20) {
                        showOverlayMessage();
                        return;
                    }
                    item.files.push({ id: fileId, name: fileName, url: fileUrl });
                    store.put(item);
                    transaction.oncomplete = function () {
                        renderFiles();
                        updateProgressBar(item.files.length);
                    };
                };
            };
        });
    } else {
        alert("Your browser does not support audio recording.");
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
}

function confirmDeleteAllFiles() {
    if (confirm("هل أنت متأكد أنك تريد حذف جميع الملفات؟")) {
        deleteAllFiles();
    }
}

function deleteAllFiles() {
    if (selectedItem) {
        let transaction = db.transaction(["items"], "readwrite");
        let store = transaction.objectStore("items");
        let request = store.get(selectedItem);

        request.onsuccess = function() {
            let item = request.result;
            item.files = [];
            store.put(item);
            transaction.oncomplete = function() {
                renderFiles();
                updateProgressBar(0);
            };
        };
    }
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const filesSection = document.getElementById("filesSection");
    const messageText = messageInput.textContent.trim();
    
    if (messageText && selectedItem) {
        let transaction = db.transaction(["items"], "readwrite");
        let store = transaction.objectStore("items");
        let request = store.get(selectedItem);

        request.onsuccess = function() {
            let item = request.result;
            if (item.files.length >= 20) {
                showOverlayMessage();
                return;
            }
            const messageId = Date.now();
            item.files.push({ id: messageId, name: "رسالة", url: messageText, type: "text" });
            store.put(item);
            transaction.oncomplete = function() {
                renderFiles();
                updateProgressBar(item.files.length);
                messageInput.textContent = "";
                messageInput.style.height = "21.5px";
                filesSection.style.marginBottom = "59px";
            };
        };
    }
}

function updateProgressBar(currentFiles) {
    const maxFiles = 20;
    const progressBar = document.getElementById("fileProgress");
    const fileCount = document.getElementById("fileCount");
    
    const percentage = (currentFiles / maxFiles) * 100;
    
    progressBar.style.width = `${percentage}%`;
    fileCount.textContent = `${currentFiles}/${maxFiles}`;
    
    if (percentage >= 90) {
        progressBar.style.backgroundColor = "#ff3b30";
        progressBar.style.boxShadow = "0 0 8px rgba(255, 59, 48, 0.6)";
    } else if (percentage >= 70) {
        progressBar.style.backgroundColor = "#ff9500";
        progressBar.style.boxShadow = "0 0 6px rgba(255, 149, 0, 0.5)";
    } else {
        progressBar.style.backgroundColor = "#34c759";
        progressBar.style.boxShadow = "0 0 4px rgba(52, 199, 89, 0.4)";
    }
    
    if (percentage > 85) {
        progressBar.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
            progressBar.style.animation = "";
        }, 500);
    }
}

function renderFiles(newFiles = []) {
    let transaction = db.transaction(["items"], "readonly");
    let store = transaction.objectStore("items");
    let request = store.get(selectedItem);

    request.onsuccess = function() {
        let fileList = document.getElementById("fileList");
        let files = request.result.files;

        // تحديث شريط التقدم وعدد الملفات
        updateProgressBar(files.length);

        if (newFiles.length > 0) {
            let fragment = document.createDocumentFragment();

            newFiles.forEach(file => {
                let div = document.createElement("div");
                div.classList.add("file");

                let fileContentDiv = document.createElement("div");
                fileContentDiv.classList.add("file-content");
                fileContentDiv.onclick = () => showFileInOverlay(file);

                if (file.type === "text") {
                    fileContentDiv.textContent = file.url;
                } else if (file.url.startsWith("data:image")) {
                    fileContentDiv.innerHTML = `
                    <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
                        <div class="gon"><img src="${file.url}" width="100" alt="${file.name}"></div>
                        <p>${file.name}</p>
                    `;
                } else if (file.url.startsWith("data:video")) {
                    fileContentDiv.innerHTML = `
                        <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
                        <div class="gon"><video width="200" controls>
                            <source src="${file.url}" type="video/mp4">
                        </video></div>
                        <p>${file.name}</p>
                    `;
                } else if (file.url.startsWith("blob:")) {
                    fileContentDiv.innerHTML = `
                        <div class="gon"><audio controls>
                            <source src="${file.url}" type="audio/wav">
                        </audio></div>
                        <p>${file.name}</p>
                    `;
                } else {
                    fileContentDiv.innerHTML = `
                        <a href="${file.url}" download>${file.name}</a>
                    `;
                }

                div.appendChild(fileContentDiv);

                let buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("zoon");
                buttonsDiv.innerHTML = `
                    <button onclick="shareFile('${file.url}', '${file.name}')" class="buttone"><icon style="background-image: url(Icon/share_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                    <button onclick="confirmDeleteFile(${file.id})" class="buttone" style="margin-bottom: 0;"><icon style="background-image: url(Icon/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                `;

                div.appendChild(buttonsDiv);
                fragment.appendChild(div);
            });

            fileList.appendChild(fragment);
        } else {
            fileList.innerHTML = "";

            function processFiles(startIndex) {
                const batchSize = 1;
                const endIndex = Math.min(startIndex + batchSize, files.length);
                let fragment = document.createDocumentFragment();

                for (let i = startIndex; i < endIndex; i++) {
                    let file = files[i];
                    let div = document.createElement("div");
                    div.classList.add("file");

                    let fileContentDiv = document.createElement("div");
                    fileContentDiv.classList.add("file-content");
                    fileContentDiv.onclick = () => showFileInOverlay(file);

                    if (file.type === "text") {
                        fileContentDiv.textContent = file.url;
                    } else if (file.url.startsWith("data:image")) {
                        fileContentDiv.innerHTML = `
                        <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
                            <div class="gon"><img src="${file.url}" width="100" alt="${file.name}"></div>
                            <p>${file.name}</p>
                        `;
                    } else if (file.url.startsWith("data:video")) {
                        fileContentDiv.innerHTML = `
                        <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 8 13"><title>tail-in</title><path opacity="0.13" fill="#0000000" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path><path fill="currentColor" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"></path></svg>
                            <div class="gon"><video width="200" controls>
                                <source src="${file.url}" type="video/mp4">
                            </video></div>
                            <p>${file.name}</p>
                        `;
                    } else if (file.url.startsWith("blob:")) {
                        fileContentDiv.innerHTML = `
                            <div class="gon"><audio controls>
                                <source src="${file.url}" type="audio/wav">
                            </audio></div>
                            <p>${file.name}</p>
                        `;
                    } else {
                        fileContentDiv.innerHTML = `
                            <a href="${file.url}" download>${file.name}</a>
                        `;
                    }

                    div.appendChild(fileContentDiv);

                    let buttonsDiv = document.createElement("div");
                    buttonsDiv.classList.add("zoon");
                    buttonsDiv.innerHTML = `
                        <button onclick="shareFile('${file.url}', '${file.name}')" class="buttone"><icon style="background-image: url(Icon/share_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                        <button onclick="confirmDeleteFile(${file.id})" class="buttone" style="margin-bottom: 0;"><icon style="background-image: url(Icon/delete_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
                    `;

                    div.appendChild(buttonsDiv);
                    fragment.appendChild(div);
                }

                fileList.appendChild(fragment);

                if (endIndex < files.length) {
                    setTimeout(() => processFiles(endIndex), 0);
                }
            }

            processFiles(0);
        }
    };
}

function confirmDeleteFile(fileId) {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا الملف؟")) {
        deleteFile(fileId);
    }
}

function deleteFile(fileId) {
    let transaction = db.transaction(["items"], "readwrite");
    let store = transaction.objectStore("items");
    let request = store.get(selectedItem);

    request.onsuccess = function() {
        let files = request.result.files;
        let index = files.findIndex(file => file.id === fileId);

        if (index !== -1) {
            files.splice(index, 1);
            store.put(request.result);
            updateProgressBar(files.length);

            const fileElements = document.querySelectorAll('#fileList .file');
            fileElements.forEach(element => {
                const deleteButton = element.querySelector('button[onclick*="confirmDeleteFile(' + fileId + ')"]');
                if (deleteButton) {
                    element.remove();
                }
            });
        }
    };
}

function shareFile(url, name) {
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], name, { type: blob.type });
            const fileURL = URL.createObjectURL(file);
            const whatsappUrl = `intent://send/?text=${encodeURIComponent(fileURL)}#Intent;package=com.whatsapp;scheme=whatsapp;end`;
            window.open(whatsappUrl, '_blank');
        });
}

function showFileInOverlay(file) {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    overlay.style.background = "#0000006b";

    let content = '';
    if (file.url.startsWith("data:image")) {
        content = `<img src="${file.url}" alt="${file.name}" style="position: relative;z-index: 5;max-width: 100%;max-height: -webkit-fill-available;margin: 1px 0;"/>`;
    } else if (file.url.startsWith("data:video")) {
        content = `
            <video controls style="animation: online 0.3s;position: relative;z-index: 5;max-width: 100%; max-height: 80%;">
                <source src="${file.url}" type="video/mp4">
            </video>
        `;
    } else if (file.url.startsWith("blob:")) {
        content = `
            <audio controls style="animation: online 0.3s;position: relative;z-index: 5;max-width: 100%; max-height: 80%;">
                <source src="${file.url}" type="audio/wav">
            </audio>
        `;
    } else {
        content = `<a href="${file.url}" class="ccd" download><ion-icon name="download-outline"></ion-icon>${file.name}</a>`;
    }

    overlay.innerHTML = `
        <div class="jokr" style="padding: 0 1px;height: 100%; align-items: center; justify-content: center; display: flex ; background: #0000;border-radius: 10px; text-align: center;">
            ${content}
            <div class="vov" onclick="hideOverlay()"></div>
            <button class="fod buttone" onclick="hideOverlay()"><icon style="background-image: url(Icon/close_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg);"></icon></button>
        </div>
    `;
}

function hideOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    overlay.innerHTML = '';
}

function showOverlayMessage() {
    document.getElementById("inputDiv").style.display = "none";
    const overlayMessage = document.getElementById("overlayMessage");
    overlayMessage.style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function hideOverlayMessage() {
    const overlayMessage = document.getElementById("overlayMessage");
    overlayMessage.style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {
    initDB();

    document.getElementById("fileInput").addEventListener("change", uploadFiles);

    document.body.insertAdjacentHTML('beforeend', '<div id="overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgb(0 0 0 / 49%) z-index: 1000;"></div>');

    document.addEventListener('click', function(event) {
        let inputDiv = document.getElementById('inputDiv');
        let overlay = document.getElementById('overlay');
        let overlayMessage = document.getElementById('overlayMessage');
        
        if (event.target === overlay) {
            if (inputDiv.style.display === "block") {
                hideInputDiv();
            }
            if (overlayMessage.style.display === "block") {
                hideOverlayMessage();
            }
            hideOverlay();
        }
    });
});
