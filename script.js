const addBtn = document.getElementById("add-note");
const input = document.getElementById("note-input");
const list = document.getElementById("notes-list");

let notes = [];

input.addEventListener("focus", function () {
  if (input.value.trim() === "") {
    input.value = "☐ ";
  }
});

input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = input.value;

    const checkbox = "☐ ";
    const newValue =
      currentValue.substring(0, start) + "\n" + checkbox + currentValue.substring(end);

    input.value = newValue;
    input.selectionStart = input.selectionEnd = start + checkbox.length + 1;
  }
});

addBtn.addEventListener("click", () => {
  const noteText = input.value.trim();
  if (noteText !== "") {
    notes.push(noteText);
    input.value = "";
    renderNotes();
  }
});

function renderNotes() {
  list.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "note";
    div.setAttribute("draggable", "true");
    div.setAttribute("data-index", index);

    const lines = note.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("☑")) {
        return `<label><input type="checkbox" checked> ${trimmed.substring(1).trim()}</label>`;
      } else if (trimmed.startsWith("☐")) {
        return `<label><input type="checkbox"> ${trimmed.substring(1).trim()}</label>`;
      } else {
        return `<label><input type="checkbox"> ${trimmed}</label>`;
      }
    }).join('<br>');

    div.innerHTML = `
      <div class="note-text">${lines}</div>
      <textarea class="edit-area" style="display:none;">${note}</textarea>
      <div style="margin-top: 10px;">
        <button class="edit-btn" onclick="editNote(${index}, this)">Edit</button>
        <button class="save-btn" style="display:none;" onclick="saveNote(${index}, this)">Save</button>
        <button class="delete-btn" onclick="deleteNote(${index})">✕</button>
      </div>
    `;

    const checkboxes = div.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox, i) => {
      checkbox.addEventListener("change", () => {
        const lines = notes[index].split('\n');
        if (checkbox.checked) {
          lines[i] = lines[i].replace(/^☐/, "☑");
        } else {
          lines[i] = lines[i].replace(/^☑/, "☐");
        }
        notes[index] = lines.join('\n');
        renderNotes(); 
      });
    });
   
    const editTextarea = div.querySelector(".edit-area");
    editTextarea.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const currentValue = this.value;

        const checkbox = "☐ ";
        const newValue =
          currentValue.substring(0, start) + "\n" + checkbox + currentValue.substring(end);

        this.value = newValue;
        this.selectionStart = this.selectionEnd = start + checkbox.length + 1;
      }
    });

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);

    list.appendChild(div);
  });
}

function editNote(index, button) {
  const noteDiv = button.closest(".note");
  const p = noteDiv.querySelector(".note-text");
  const textarea = noteDiv.querySelector(".edit-area");
  const saveBtn = noteDiv.querySelector(".save-btn");

  p.style.display = "none";
  textarea.style.display = "block";
  button.style.display = "none";
  saveBtn.style.display = "inline";
}

function saveNote(index, button) {
  const noteDiv = button.closest(".note");
  const p = noteDiv.querySelector(".note-text");
  const textarea = noteDiv.querySelector(".edit-area");
  const editBtn = noteDiv.querySelector(".edit-btn");

  const newText = textarea.value.trim();
  if (newText !== "") {
    notes[index] = newText;
  }

  p.style.display = "block";
  textarea.style.display = "none";
  button.style.display = "none";
  editBtn.style.display = "inline";

  renderNotes(); 
}

function deleteNote(i) {
  notes.splice(i, 1);
  renderNotes();
}

let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = +e.target.getAttribute("data-index");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  const droppedIndex = +e.target.closest(".note").getAttribute("data-index");

  if (draggedIndex !== null && draggedIndex !== droppedIndex) {
    const draggedNote = notes[draggedIndex];
    notes.splice(draggedIndex, 1);
    notes.splice(droppedIndex, 0, draggedNote);
    renderNotes();
  }

  draggedIndex = null;
}

