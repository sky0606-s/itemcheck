const DATA_URL = "data.json";
const STORAGE_KEY = "checklist-checked";
const GROUPING_KEY = "checklist-grouping";

let items = [];
let checkedSet = new Set();

const loadChecked = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(arr)) checkedSet = new Set(arr);
  } catch {}
};
const saveChecked = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedSet]));
};

const loadGrouping = () => localStorage.getItem(GROUPING_KEY) || "none";
const saveGrouping = (val) => localStorage.setItem(GROUPING_KEY, val);

function renderList(groupSize = 0) {
  const ul = document.getElementById("checklist");
  ul.innerHTML = "";
  ul.setAttribute("aria-busy", "true");

  const numberingOn = groupSize > 0;

  items.forEach((text, idx) => {
    const li = document.createElement("li");
    li.className = "item";

    const num = document.createElement("div");
    num.className = "num" + (numberingOn ? "" : " hidden");
    if (numberingOn) {
      num.textContent = ((idx % groupSize) + 1).toString();
    } else {
      num.textContent = "";
    }

    const cbWrap = document.createElement("div");
    cbWrap.className = "cb";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `cb-${idx}`;
    cb.checked = checkedSet.has(idx);
    cb.addEventListener("change", () => {
      if (cb.checked) checkedSet.add(idx);
      else checkedSet.delete(idx);
      saveChecked();
    });
    cbWrap.appendChild(cb);

    const label = document.createElement("label");
    label.className = "label";
    label.setAttribute("for", cb.id);
    label.textContent = text;

    li.append(num, cbWrap, label);
    ul.appendChild(li);

    const isEndOfBlock = numberingOn && ((idx + 1) % groupSize === 0) && (idx !== items.length - 1);
    if (isEndOfBlock) {
      const hr = document.createElement("hr");
      hr.className = "separator";
      ul.appendChild(hr);
    }
  });

  ul.removeAttribute("aria-busy");
}

async function init() {
  loadChecked();
  const lastGrouping = loadGrouping();

  document.querySelectorAll('input[name="grouping"]').forEach((el) => {
    el.checked = (el.value === lastGrouping);
    el.addEventListener("change", () => {
      const val = el.value;
      saveGrouping(val);
      const size = val === "27" ? 27 : val === "54" ? 54 : 0;
      renderList(size);
    });
  });

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    items = await res.json();
    if (!Array.isArray(items)) throw new Error("data.json は配列である必要があります。");
  } catch (e) {
    console.error(e);
    items = ["（data.jsonの読み込みに失敗しました）"];
  }

  const initialSize = lastGrouping === "27" ? 27 : lastGrouping === "54" ? 54 : 0;
  renderList(initialSize);
}

document.addEventListener("DOMContentLoaded", init);
