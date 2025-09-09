// basic logic: 10 MB/sec => ₹17/sec (1.7 per MB). Track in localStorage for history
const MB_PER_SEC = 10;
const INR_PER_SEC = 17;
const SESSION_TARGET_MB = 500; // for progress calculation

let mbSold = 0;
let earnings = 0;
let selling = false;
let interval = null;

const mbEl = document.getElementById('mb-sold');
const earnEl = document.getElementById('earnings');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const modal = document.getElementById('modal');
const successModal = document.getElementById('success-modal');
const withdrawAmountEl = document.getElementById('withdraw-amount');
const userUpiInput = document.getElementById('user-upi');
const modalContinue = document.getElementById('modal-continue');
const modalCancel = document.getElementById('modal-cancel');
const successOk = document.getElementById('success-ok');
const successAmount = document.getElementById('success-amount');
const successTxn = document.getElementById('success-txn');
const headerUpi = document.getElementById('header-upi');
const historyList = document.getElementById('history-list');
const clearHistory = document.getElementById('clear-history');

// load history
function loadHistory(){
  const raw = localStorage.getItem('withdrawals_v1');
  if(!raw) return [];
  try { return JSON.parse(raw) } catch(e){ return [] }
}
function saveHistory(list){ localStorage.setItem('withdrawals_v1', JSON.stringify(list)); }
function renderHistory(){
  const list = loadHistory();
  historyList.innerHTML = '';
  if(list.length===0){
    historyList.innerHTML = '<div style="padding:12px;color:#d0c8ff">No withdrawals yet</div>';
    return;
  }
  list.slice().reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-row';
    div.innerHTML = `<div>
      <div style="font-weight:700">${item.amount}</div>
      <small>${item.upi}</small>
    </div>
    <div style="text-align:right">
      <small>${item.date}</small><br/>
      <small>TXN: ${item.txn}</small>
    </div>`;
    historyList.appendChild(div);
  });
}
renderHistory();

function updateUI(){
  mbEl.innerHTML = mbSold.toFixed(1) + ' <span class="unit">MB</span>';
  earnEl.innerText = '₹' + Math.round(earnings);
  const pct = Math.min(100, (mbSold / SESSION_TARGET_MB) * 100);
  progressFill.style.width = pct + '%';
  progressText.innerText = pct.toFixed(1) + '%';
  withdrawAmountEl.innerText = '₹' + Math.round(earnings);
}

function startSelling(){
  if(selling) return;
  selling = true;
  startBtn.disabled = true;
  startBtn.style.opacity = 0.9;
  interval = setInterval(()=>{
    mbSold += MB_PER_SEC;
    earnings += INR_PER_SEC;
    updateUI();
  }, 1000);
}

function stopAndOpenWithdraw(){
  if(!selling && earnings<=0){
    alert('No earnings to withdraw');
    return;
  }
  // stop selling
  if(interval) clearInterval(interval);
  selling = false;
  startBtn.disabled = false;
  // open modal with amount
  withdrawAmountEl.innerText = '₹' + Math.round(earnings);
  userUpiInput.value = '';
  modal.classList.remove('hidden');
}

startBtn.addEventListener('click', startSelling);
stopBtn.addEventListener('click', stopAndOpenWithdraw);

modalCancel.addEventListener('click', ()=> modal.classList.add('hidden'));

modalContinue.addEventListener('click', ()=>{
  const upi = userUpiInput.value && userUpiInput.value.trim();
  if(!upi){
    alert('Please enter your UPI ID');
    return;
  }
  // create txn
  const txn = 'TXN' + Math.floor(Math.random()*90000000 + 10000000);
  const date = new Date().toLocaleString();
  const amount = Math.round(earnings);
  const record = { date, amount: '₹' + amount, upi, txn };
  const list = loadHistory();
  list.push(record);
  saveHistory(list);
  // show success modal
  successAmount.innerText = '₹' + amount;
  successTxn.innerText = txn;
  modal.classList.add('hidden');
  successModal.classList.remove('hidden');
  // update header upi to last used (optional)
  headerUpi.innerText = 'UPI: ' + upi;
  // reset earnings and mb
  earnings = 0; mbSold = 0;
  updateUI();
  renderHistory();
});

successOk.addEventListener('click', ()=> successModal.classList.add('hidden'));

clearHistory.addEventListener('click', ()=>{
  if(confirm('Clear withdrawal history?')){
    localStorage.removeItem('withdrawals_v1');
    renderHistory();
  }
});

// initial UI update
updateUI();
renderHistory();