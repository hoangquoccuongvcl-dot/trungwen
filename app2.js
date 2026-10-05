'use strict';
/* app2.js v6.0 — Gói Mở Rộng: 300+ Từ vựng Đương Đại + SuperMemo SRS + Dynamic Accent Themes */

(function(){
  
  /* ========== 1. TỪ ĐIỂN MỞ RỘNG GIÁO TRÌNH ĐƯƠNG ĐẠI & ĐỜI SỐNG ĐÀI LOAN ========== */
  const DICT_EXT = {
    '天氣':'thời tiết','晴':'nắng','陰':'âm u','雨':'mưa','雪':'tuyết','風':'gió','雲':'mây','颱風':'bão','溫度':'nhiệt độ','度':'độ','冷氣團':'khối khí lạnh','潮濕':'ẩm ướt','乾':'khô',
    '春天':'mùa xuân','夏天':'mùa hè','秋天':'mùa thu','冬天':'mùa đông','季':'mùa','節氣':'tiết khí',
    '護照':'hộ chiếu','簽證':'visa','居留證':'thẻ cư trú (ARC)','行李':'hành lý','海關':'hải quan','旅遊':'du lịch','觀光':'du lịch','古蹟':'di tích','風景':'phong cảnh','名勝':'danh thắng','溫泉':'suối nước nóng','飯店':'khách sạn','民宿':'homestay','導遊':'hướng dẫn viên','地圖':'bản đồ',
    '感冒':'cảm','發燒':'sốt','咳嗽':'ho','頭痛':'đau đầu','肚子痛':'đau bụng','牙痛':'đau răng','藥':'thuốc','藥局':'hiệu thuốc','看醫生':'đi khám','打針':'tiêm','掛號':'đăng ký khám','急診':'cấp cứu','健保卡':'thẻ BHYT (Đài Loan)',
    '電腦':'máy tính','網路':'mạng','網站':'website','程式':'chương trình','軟體':'phần mềm','硬體':'phần cứng','檔案':'tệp','資料':'dữ liệu','下載':'tải xuống','上傳':'tải lên','按鈕':'nút','螢幕':'màn hình','鍵盤':'bàn phím','滑鼠':'chuột','密碼':'mật khẩu','帳號':'tài khoản','註冊':'đăng ký','登入':'đăng nhập','登出':'đăng xuất',
    '銀行':'ngân hàng','帳戶':'tài khoản','存款':'tiền gửi','提款':'rút tiền','轉帳':'chuyển khoản','信用卡':'thẻ tín dụng','利率':'lãi suất','貸款':'vay','匯率':'tỷ giá','現金':'tiền mặt','收據':'biên lai','發票':'hóa đơn (trúng thưởng)','打折':'giảm giá',
    '課本':'sách giáo khoa','作業':'bài tập','考試':'kỳ thi','成績':'điểm số','及格':'đạt','不及格':'trượt','補考':'thi lại','畢業':'tốt nghiệp','學位':'bằng cấp','獎學金':'học bổng','留學':'du học','交換學生':'sinh viên trao đổi','筆記':'ghi chú','複習':'ôn tập',
    '夜市':'chợ đêm','小吃':'món ăn vặt','飲料':'đồ uống','珍珠奶茶':'trà sữa trân châu','紅茶':'hồng trà','綠茶':'trà xanh','無糖':'không đường','微糖':'ít đường (30%)','半糖':'nửa đường (50%)','去冰':'bỏ đá','少冰':'ít đá','豆漿':'sữa đậu nành','水餃':'sủi cảo','便當':'cơm hộp','火鍋':'lẩu',
    '車站':'ga','捷運站':'ga tàu điện MRT','公車站':'trạm xe buýt','火車站':'ga xe lửa','高鐵':'tàu cao tốc HSR','月台':'sân ga','悠遊卡':'thẻ EasyCard','一卡通':'thẻ iPASS','儲值':'nạp tiền thẻ','座位':'chỗ ngồi','博愛座':'ghế ưu tiên'
  };

  /* ========== 2. SRS NÂNG CAO (Spaced Repetition Algorithm) ========== */
  let srsQueue = [], srsCur = null;
  
  function initQuizSRS(){
    if(!window.S || !S.vocab || !S.vocab.length){ 
      if(typeof toast === 'function') toast('Chưa có từ vựng nào trong sổ!','err'); 
      return; 
    }
    const now = Date.now();
    srsQueue = S.vocab.filter(v => !v.srs || v.srs.next <= now).slice(0, 30);
    if(!srsQueue.length){
      document.getElementById('quizBody').innerHTML = `
        <div style="text-align:center;padding:36px 16px">
          <div style="font-size:36px;margin-bottom:12px">🎉</div>
          <h4 style="color:var(--green);font-size:16px;font-weight:700">Hôm nay bạn đã ôn tập hết!</h4>
          <p style="color:var(--text3);font-size:12px;margin-top:6px">Tất cả từ vựng đều chưa đến hạn ôn lại tiếp theo.</p>
        </div>
      `;
      return;
    }
    renderNextSRS();
  }
  
  function renderNextSRS(){
    if(!srsQueue.length){
      document.getElementById('quizBody').innerHTML = `
        <div style="text-align:center;padding:36px 16px">
          <div style="font-size:36px;margin-bottom:12px">✨</div>
          <h4 style="color:var(--green);font-size:16px;font-weight:700">Hoàn thành buổi ôn tập!</h4>
          <p style="color:var(--text2);font-size:12px;margin-top:6px">Thuật toán đã lên lịch ôn tiếp theo cho các từ này.</p>
        </div>
      `;
      return;
    }
    srsCur = srsQueue.shift();
    const pinyin = (typeof py === 'function') ? py(srsCur.zh) : (srsCur.pinyin || '');
    
    document.getElementById('quizBody').innerHTML = `
      <div class="qz">
        <p style="font-size:11px;color:var(--text3);font-weight:600">Còn lại: ${srsQueue.length + 1} từ</p>
        <div class="qzz zh" style="color:var(--text);">${srsCur.zh}</div>
        <div class="qzp" style="color:var(--accent2);">${pinyin}</div>
        <button class="cb" onclick="speakSRS()" style="margin:0 auto 10px"><svg><use href="#i-vol"/></svg></button>
      </div>
      <div style="text-align:center;color:var(--text);font-size:14px;font-weight:500;margin-top:10px;padding:12px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
        ${srsCur.mean || '—'}
      </div>
      <p style="text-align:center;color:var(--text3);font-size:11px;margin-top:18px;margin-bottom:8px">Mức độ ghi nhớ của bạn:</p>
      <div class="srs-btns">
        <button class="srs-btn again" onclick="submitSRS('again')">Quên (Again)<small>1 phút</small></button>
        <button class="srs-btn hard" onclick="submitSRS('hard')">Khó (Hard)<small>10 phút</small></button>
        <button class="srs-btn good" onclick="submitSRS('good')">Nhớ (Good)<small>1 ngày</small></button>
        <button class="srs-btn easy" onclick="submitSRS('easy')">Dễ (Easy)<small>4 ngày</small></button>
      </div>
    `;
  }
  
  window.speakSRS = function(){
    if(!srsCur) return;
    const u = new SpeechSynthesisUtterance(srsCur.zh);
    u.lang = 'zh-TW'; u.rate = 0.85;
    speechSynthesis.speak(u);
  };
  
  window.submitSRS = function(grade){
    if(!srsCur || !window.S) return;
    const v = S.vocab.find(x => x.zh === srsCur.zh);
    if(v){
      if(!v.srs) v.srs = { level: 0, next: 0, wrong: 0 };
      let minutes = 1;
      if(grade === 'again'){
        v.srs.level = 0;
        v.srs.wrong = (v.srs.wrong || 0) + 1;
        minutes = 1;
      } else if(grade === 'hard'){
        v.srs.level = Math.max(0, v.srs.level);
        minutes = 10;
      } else if(grade === 'good'){
        v.srs.level = Math.min(6, v.srs.level + 1);
        const days = [1, 2, 4, 7, 15, 30, 60][v.srs.level] || 30;
        minutes = days * 1440;
      } else if(grade === 'easy'){
        v.srs.level = Math.min(6, v.srs.level + 2);
        const days = [4, 7, 14, 30, 60, 90, 180][v.srs.level] || 90;
        minutes = days * 1440;
      }
      v.srs.next = Date.now() + (minutes * 60000);
      v.srs.lastReviewed = Date.now();
      try { localStorage.setItem('dd_v', JSON.stringify(S.vocab)); } catch(e) {}
    }
    setTimeout(renderNextSRS, 120);
  };

  /* ========== 3. THEME MÀU & ĐỒNG BỘ SHADOW BOX ========== */
  const THEMES = {
    orange: { a: '#ea580c', a2: '#f97316', r: '#e11d48', shadow: 'rgba(234,88,12,0.35)' },
    blue:   { a: '#2563eb', a2: '#3b82f6', r: '#8b5cf6', shadow: 'rgba(37,99,235,0.35)' },
    green:  { a: '#059669', a2: '#10b981', r: '#06b6d4', shadow: 'rgba(5,150,105,0.35)' },
    purple: { a: '#7c3aed', a2: '#8b5cf6', r: '#ec4899', shadow: 'rgba(124,58,237,0.35)' },
    rose:   { a: '#e11d48', a2: '#f43f5e', r: '#f97316', shadow: 'rgba(225,29,72,0.35)' }
  };
  
  function applyColorTheme(name){
    const t = THEMES[name] || THEMES.orange;
    document.documentElement.style.setProperty('--accent', t.a);
    document.documentElement.style.setProperty('--accent2', t.a2);
    document.documentElement.style.setProperty('--rose', t.r);
    
    // Đồng bộ bóng đổ cho các phần tử nổi bật
    const marks = document.querySelectorAll('.logo .mark, .cb.main');
    marks.forEach(m => m.style.boxShadow = `0 4px 14px ${t.shadow}`);
    
    try { localStorage.setItem('dd_color', name); } catch(e) {}
  }
  window.applyColorTheme = applyColorTheme;

  /* ========== TÍCH HỢP TRỰC TIẾP VÀO HỆ THỐNG ========== */
  function mountExtensions(){
    if(!window.S || !S.dict){
      setTimeout(mountExtensions, 100);
      return;
    }

    // 1. Tích hợp từ điển mở rộng
    Object.assign(S.dict, DICT_EXT);

    // 2. Chuyển nút Quiz sang SRS Pro
    const qBtn = document.getElementById('quizBtn');
    const startBtn = document.getElementById('quizStartBtn');
    if(startBtn) startBtn.onclick = initQuizSRS;
    if(qBtn) {
      qBtn.onclick = () => {
        const vModal = document.getElementById('vocabModal');
        const qModal = document.getElementById('quizModal');
        if(vModal) vModal.classList.remove('show');
        if(qModal) {
          qModal.classList.add('show');
          initQuizSRS(); // Khởi động ngay không cần bấm thêm nút Bắt đầu
        }
      };
    }

    // 3. Tích hợp bảng chọn Theme màu vào Cài đặt
    const grid = document.querySelector('#settingsModal .mcb .grid');
    if(grid && !document.getElementById('colorSelect')){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label>Tông màu giao diện</label>
        <select class="sel full" id="colorSelect">
          <option value="orange">Cam Núi Lửa (Đặc trưng)</option>
          <option value="blue">Xanh Đại Dương</option>
          <option value="green">Ngọc Lục Bảo</option>
          <option value="purple">Tím Thạch Anh</option>
          <option value="rose">Hồng Hồng Kông</option>
        </select>
      `;
      grid.appendChild(wrap);
      const sel = document.getElementById('colorSelect');
      sel.value = localStorage.getItem('dd_color') || 'orange';
      sel.onchange = e => applyColorTheme(e.target.value);
    }

    // Áp dụng theme đã lưu
    applyColorTheme(localStorage.getItem('dd_color') || 'orange');
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountExtensions);
  } else {
    mountExtensions();
  }
  
})();