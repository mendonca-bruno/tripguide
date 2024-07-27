document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    populateSectionSelect();
    setupSmoothScroll();
    showSection('home');
});

function setupSmoothScroll() {
    const links = document.querySelectorAll('.sidebar a');
    for (const link of links) {
        link.addEventListener('click', smoothScroll);
    }
}

function smoothScroll(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop,
            behavior: "smooth"
        });
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section, .home');
    sections.forEach(section => {
        section.classList.remove('show');
    });

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.add('show');
    }

    if (sectionId === 'imigration') {
        document.getElementById('home').style.display = 'none';
    } else {
        document.getElementById('home').style.display = 'block';
    }
}

function addNote() {
    const sectionNumber = document.getElementById('sectionSelect').value;
    const newKeyword = document.getElementById('newKeyword').value.trim();
    const newNote = document.getElementById('newNote').value.trim();
    const section = document.getElementById(`section${sectionNumber}`);

    if (section && (newKeyword || newNote)) {
        if (newKeyword) {
            const keywordDiv = section.querySelector('.keywords');
            const newKeywordSpan = document.createElement('span');
            newKeywordSpan.textContent = `, ${newKeyword}`;
            const deleteButton = createDeleteButton(newKeywordSpan, sectionNumber, newKeyword, 'keyword');
            newKeywordSpan.appendChild(deleteButton);
            keywordDiv.appendChild(newKeywordSpan);
            saveNoteToLocalStorage(sectionNumber, newKeyword, 'keyword');
        }

        if (newNote) {
            const examplesDiv = section.querySelector('.examples');
            const newNoteDiv = document.createElement('div');
            newNoteDiv.innerHTML = `<strong>Nota:</strong> ${newNote}`;
            const deleteButton = createDeleteButton(newNoteDiv, sectionNumber, newNote, 'note');
            newNoteDiv.appendChild(deleteButton);
            examplesDiv.appendChild(newNoteDiv);
            saveNoteToLocalStorage(sectionNumber, newNote, 'note');
        }

        showFeedbackMessage('Nota/Palavra-chave adicionada com sucesso!');
    } else {
        showFeedbackMessage('Por favor, insira um número de seção válido e pelo menos uma palavra-chave ou nota.', true);
    }

    document.getElementById('newKeyword').value = '';
    document.getElementById('newNote').value = '';

    toggleAddNoteForm();
    updateDeleteButtons();
}

function createDeleteButton(parentElement, sectionNumber, value, type) {
    const deleteButton = document.createElement('i');
    deleteButton.className = 'fas fa-trash delete-button';
    deleteButton.onclick = function() {
        parentElement.remove();
        removeNoteFromLocalStorage(sectionNumber, value, type);
    };
    return deleteButton;
}

function toggleAddNoteForm() {
    const addNotesContainer = document.getElementById('addNotesContainer');
    addNotesContainer.classList.toggle('show');
}

function showFeedbackMessage(message, isError = false) {
    const feedbackMessage = document.getElementById('feedbackMessage');
    feedbackMessage.textContent = message;
    feedbackMessage.style.color = isError ? 'red' : 'green';
    feedbackMessage.style.display = 'block';
    setTimeout(() => {
        feedbackMessage.style.display = 'none';
    }, 3000);
}

function saveNoteToLocalStorage(sectionNumber, value, type) {
    const key = `section${sectionNumber}`;
    let notes = JSON.parse(localStorage.getItem(key)) || { keywords: [], notes: [] };

    if (type === 'keyword') {
        notes.keywords.push(value);
    } else if (type === 'note') {
        notes.notes.push(value);
    }

    localStorage.setItem(key, JSON.stringify(notes));
}

function removeNoteFromLocalStorage(sectionNumber, value, type) {
    const key = `section${sectionNumber}`;
    let notes = JSON.parse(localStorage.getItem(key));

    if (notes) {
        if (type === 'keyword') {
            notes.keywords = notes.keywords.filter(keyword => keyword.trim() !== value.trim());
        } else if (type === 'note') {
            notes.notes = notes.notes.filter(note => note.trim() !== value.trim());
        }
        localStorage.setItem(key, JSON.stringify(notes));
    }
}

function loadNotes() {
    const sections = document.querySelectorAll('.section-content');

    sections.forEach(section => {
        const sectionNumber = section.id.replace('section', '');
        const key = `section${sectionNumber}`;
        const notes = JSON.parse(localStorage.getItem(key));

        if (notes) {
            const keywordDiv = section.querySelector('.keywords');
            const examplesDiv = section.querySelector('.examples');

            notes.keywords.forEach(keyword => {
                const newKeywordSpan = document.createElement('span');
                newKeywordSpan.textContent = `, ${keyword}`;
                const deleteButton = createDeleteButton(newKeywordSpan, sectionNumber, keyword, 'keyword');
                newKeywordSpan.appendChild(deleteButton);
                keywordDiv.appendChild(newKeywordSpan);
            });

            notes.notes.forEach(note => {
                const newNoteDiv = document.createElement('div');
                newNoteDiv.innerHTML = `<strong>Nota:</strong> ${note}`;
                const deleteButton = createDeleteButton(newNoteDiv, sectionNumber, note, 'note');
                newNoteDiv.appendChild(deleteButton);
                examplesDiv.appendChild(newNoteDiv);
            });

            if (notes.keywords.length > 0 || notes.notes.length > 0) {
                section.classList.add('show');
            }
        }
    });
}

function populateSectionSelect() {
    const sectionSelect = document.getElementById('sectionSelect');
    sectionSelect.innerHTML = '';
    const sections = document.querySelectorAll('.section-content');

    sections.forEach(section => {
        const sectionNumber = section.id.replace('section', '');
        const sectionTitle = section.querySelector('h2').textContent.trim();
        const option = document.createElement('option');
        option.value = sectionNumber;
        option.textContent = `${sectionNumber}. ${sectionTitle}`;
        sectionSelect.appendChild(option);
    });
}

function showAllSections() {
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.add('show');
    });
}

function updateDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(deleteButton => {
        const parentElement = deleteButton.parentElement;
        const sectionNumber = parentElement.closest('.section-content').id.replace('section', '');
        const value = parentElement.textContent.replace(deleteButton.textContent, '').trim();
        const type = parentElement.closest('.keywords') ? 'keyword' : 'note';
        deleteButton.onclick = function() {
            parentElement.remove();
            removeNoteFromLocalStorage(sectionNumber, value, type);
        };
    });
}
