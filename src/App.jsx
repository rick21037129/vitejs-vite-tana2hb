import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

// --- 資料定義 ---
const REGIONS = [
  '花蓮市', '吉安鄉', '新城鄉', '秀林鄉', '壽豐鄉', 
  '鳳林鎮', '萬榮鄉', '光復鄉', '卓溪鄉', '豐濱鄉', 
  '瑞穗鄉', '玉里鎮', '富里鄉'
];

const OFI8_QUESTIONS = [
  { id: 1, text: '與 6 個月前相比，你在吃堅硬的食物有困難嗎？', yesScore: 2, noScore: 0 },
  { id: 2, text: '你最近有被茶或湯嗆到嗎？', yesScore: 2, noScore: 0 },
  { id: 3, text: '你有用假牙嗎？', yesScore: 2, noScore: 0 },
  { id: 4, text: '你經常口乾舌燥嗎？', yesScore: 1, noScore: 0 },
  { id: 5, text: '你出門的頻率比去年少嗎？', yesScore: 1, noScore: 0 },
  { id: 6, text: '你能吃魷魚乾或醃蘿蔔之類堅硬的食物嗎？', yesScore: 0, noScore: 1 },
  { id: 7, text: '你一天刷幾次牙？(每天 2 次或更多次)', yesScore: 0, noScore: 1 },
  { id: 8, text: '您是否至少每年看一次牙科？', yesScore: 0, noScore: 1 },
];

const EAT10_QUESTIONS = [
  '吞嚥問題是否導致我的體重下降', '吞嚥是否干擾我外出飲食', '吞嚥液狀物需額外費力',
  '吞嚥固狀物需額外費力', '吞服藥丸時需額外特別費力', '吞嚥是否會導致疼痛',
  '飲食的愉悅是否為吞嚥問題影響', '吞嚥食物時會黏著咽喉', '吃東西時是否會咳嗽', '吞嚥時是否有壓迫感'
];

const OHAT_CATEGORIES = [
  { id: 'lips', name: '嘴唇', opts: ['平滑、粉紅、濕潤', '乾裂、嘴角紅', '潰瘍、出血'] },
  { id: 'tongue', name: '舌頭', opts: ['粉紅、濕潤可見乳突', '發紅、發紫、蒼白、乾裂、舌苔覆蓋', '非常紅或白斑、潰瘍(出血或不出血)'] },
  { id: 'gums', name: '牙齦組織', opts: ['粉紅、結實、濕潤', '乾燥浮腫(蒼白或發紅)有1個白斑', '潰瘍、出血、多於1個白斑'] },
  { id: 'saliva', name: '唾液', opts: ['容易吐出、唾液呈水狀', '不易吐出、唾液少且黏稠', '無法吐出、唾液很少且非常黏稠'] },
  { id: 'naturalTeeth', name: '自然牙', opts: ['沒有齲齒或斷牙', '1-3顆齲齒或斷牙', '4顆以上齲齒、斷牙或牙齒少於4顆無假牙'] },
  { id: 'dentures', name: '假牙', opts: ['沒損壞，有規律戴(或無假牙)', '1處損壞，每天戴1-2小時', '多於1處損壞，沒有戴、假牙需黏合'] },
  { id: 'hygiene', name: '口腔清潔', opts: ['清潔且沒有食物殘渣', '局部牙菌斑或食物殘渣', '多處牙菌斑或食物殘渣'] },
  { id: 'pain', name: '牙齒疼痛', opts: ['沒有行為、言語或生理現象表示', '有行為或言語現象表示(拉臉、咬唇)', '有生理現象表示(臉腫、大片潰瘍)'] },
];

const OF5_QUESTIONS = [
  { id: 'q1', text: '您的天然牙齒還剩下多少顆？', opts: [{label: '0-19 顆', val: 1}, {label: '≧ 20 顆', val: 0}] },
  { id: 'q2', text: '與6個月前相比，您吃硬的食物是否有困難？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q3', text: '您最近是否被茶或湯嗆到了？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q4', text: '您是否經常感到口乾？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q5', text: '您最近在發音清晰度方面是否感到困難，或發「ta」音的速度異常？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
];

// 牙齒編號 (FDI 系統)
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export default function OralHealthAssessment() {
  // --- 狀態管理 ---
  const [patientInfo, setPatientInfo] = useState({ name: '', id: '', date: '', region: '' });
  const [ofi8, setOfi8] = useState({});
  const [eat10, setEat10] = useState({});
  const [tci, setTci] = useState(Array(9).fill(0));
  const [ohat, setOhat] = useState({});
  const [of5, setOf5] = useState({});
  
  // 口篩表狀態
  const [oralScreening, setOralScreening] = useState({
    dietMethod: '', foodType: '', eatingAbility: '',
    dentalStatus: {}, // 牙齒現況紀錄 { '18': 'D', '17': 'M', ... }
    upperDenture: '', upperDentureUsage: '',
    lowerDenture: '', lowerDentureUsage: '',
    otherDiseases: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 計算分數 ---
  const calculateOFI8 = () => {
    let score = 0;
    OFI8_QUESTIONS.forEach(q => {
      if (ofi8[q.id] === 'yes') score += q.yesScore;
      if (ofi8[q.id] === 'no') score += q.noScore;
    });
    return score;
  };

  const calculateEAT10 = () => Object.values(eat10).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const calculateTCI = () => ((tci.reduce((a, b) => a + b, 0) / 18) * 100).toFixed(2);
  const calculateOHAT = () => Object.values(ohat).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const calculateOF5 = () => Object.values(of5).reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  // 處理口篩表複選題
  const handleDiseaseToggle = (disease) => {
    setOralScreening(prev => {
      const current = prev.otherDiseases;
      if (current.includes(disease)) {
        return { ...prev, otherDiseases: current.filter(d => d !== disease) };
      } else {
        return { ...prev, otherDiseases: [...current, disease] };
      }
    });
  };

  // 處理牙齒狀態變更
  const handleDentalStatusChange = (tooth, status) => {
    setOralScreening(prev => ({
      ...prev,
      dentalStatus: {
        ...prev.dentalStatus,
        [tooth]: status
      }
    }));
  };

  // --- 儲存資料 ---
  const handleSave = async () => {
    if (!patientInfo.name || !patientInfo.id || !patientInfo.region) {
      alert('請填寫姓名、身分證字號與地區！');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: patientInfo.name,
      id: patientInfo.id,
      date: patientInfo.date,
      region: patientInfo.region,
      ofi8Score: calculateOFI8(),
      eat10Score: calculateEAT10(),
      tciScore: calculateTCI(),
      ohatScore: calculateOHAT(),
      of5Score: calculateOF5(),
      oralScreening: JSON.stringify(oralScreening)
    };

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1i2bQ61kLAni9GE4ZpKtdE51BIZaecTn9lOrLf_Rxexi9zhqxm4_aXb1Vm4dAITcw/exec';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (result.status === 'success' || result.result === 'success') {
        alert('儲存成功！');
      } else {
        alert('儲存成功，但回傳格式未確認。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('請求已送出！請檢查 Google 試算表是否有新增資料。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 區塊渲染組件 ---
  const Card = ({ title, children, score, alertCondition, alertText }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-blue-800 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {score !== undefined && (
          <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
            總分: {score}
          </div>
        )}
      </div>
      {alertCondition && (
        <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center text-red-600 text-sm font-bold">
          <AlertCircle className="w-4 h-4 mr-2" />
          {alertText}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* 頂部導航 */}
      <div className="bg-blue-900 shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <ClipboardList className="w-6 h-6 text-white mr-3" />
          <h1 className="text-xl font-bold text-white">預防口腔衰弱評估</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* 1. 基本資料 */}
        <Card title="基本資料">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
              <div className="relative">
                <select 
                  value={patientInfo.region}
                  onChange={(e) => setPatientInfo({...patientInfo, region: e.target.value})}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">請選擇地區</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input 
                type="text" 
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 focus:ring-2 focus:ring-blue-500" 
                placeholder="輸入姓名" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號</label>
              <input 
                type="text" 
                value={patientInfo.id}
                onChange={(e) => setPatientInfo({...patientInfo, id: e.target.value})}
                className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 focus:ring-2 focus:ring-blue-500" 
                placeholder="輸入身分證" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">評估日期</label>
              <input 
                type="date" 
                value={patientInfo.date}
                onChange={(e) => setPatientInfo({...patientInfo, date: e.target.value})}
                className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
        </Card>

        {/* 2. OFI-8 */}
        <Card 
          title="口腔衰弱指數8 (OFI-8)" 
          score={calculateOFI8()} 
          alertCondition={calculateOFI8() >= 4} 
          alertText="疑似口腔衰弱 (≥4分)"
        >
          <div className="space-y-4">
            {OFI8_QUESTIONS.map((q) => (
              <div key={q.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{q.id}. {q.text}</span>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center border border-gray-200 hover:bg-blue-50">
                    <input type="radio" name={`ofi8-${q.id}`} value="yes" onChange={() => setOfi8({...ofi8, [q.id]: 'yes'})} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">是</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center border border-gray-200 hover:bg-blue-50">
                    <input type="radio" name={`ofi8-${q.id}`} value="no" onChange={() => setOfi8({...ofi8, [q.id]: 'no'})} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">否</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. EAT-10 */}
        <Card 
          title="吞嚥困難篩選 (EAT-10)" 
          score={calculateEAT10()} 
          alertCondition={calculateEAT10() >= 3} 
          alertText="異常 (≥3分)"
        >
          <p className="text-xs text-gray-500 mb-4">0 = 沒有問題, 4 = 問題很嚴重</p>
          <div className="space-y-5">
            {EAT10_QUESTIONS.map((q, idx) => (
              <div key={idx} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{idx + 1}. {q}</span>
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {[0, 1, 2, 3, 4].map(score => (
                    <label key={score} className="flex flex-col items-center cursor-pointer p-2 hover:bg-blue-100 rounded-md flex-1">
                      <input type="radio" name={`eat10-${idx}`} value={score} onChange={(e) => setEat10({...eat10, [idx]: e.target.value})} className="w-4 h-4 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-gray-600">{score}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. TCI */}
        <Card 
          title="舌苔指數 (TCI)" 
          score={`${calculateTCI()}%`} 
          alertCondition={parseFloat(calculateTCI()) >= 50} 
          alertText="異常 (≥50%)"
        >
          <p className="text-xs text-gray-500 mb-4 text-center">將舌頭區分為九宮格。0: 無舌苔, 1: 薄舌苔, 2: 厚舌苔</p>
          <div className="flex justify-center my-4">
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs aspect-square">
              {tci.map((val, idx) => (
                <div key={idx} className="border-2 border-pink-200 rounded-xl flex flex-col items-center justify-center bg-pink-50/50">
                  <select 
                    className="block w-16 text-center rounded-lg border-gray-300 bg-white shadow-sm focus:border-pink-500 focus:ring-pink-500 text-lg font-bold p-2"
                    value={val}
                    onChange={(e) => {
                      const newTci = [...tci];
                      newTci[idx] = parseInt(e.target.value);
                      setTci(newTci);
                    }}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 5. OHAT */}
        <Card 
          title="口腔健康評估 (OHAT)" 
          score={calculateOHAT()} 
          alertCondition={calculateOHAT() >= 4} 
          alertText="異常 (≥4分)"
        >
          <div className="space-y-6">
            {OHAT_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-blue-900 mb-3 font-bold bg-blue-50 inline-block px-3 py-1 rounded-md self-start">{cat.name}</span>
                <div className="space-y-2">
                  {cat.opts.map((opt, idx) => (
                    <label key={idx} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${ohat[cat.id] === idx ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                      <input type="radio" name={`ohat-${cat.id}`} checked={ohat[cat.id] === idx} onChange={() => setOhat({...ohat, [cat.id]: idx})} className="mt-0.5 w-4 h-4 text-blue-600 mr-3 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{idx} 分</span>
                        <span className="text-xs text-gray-500 mt-1">{opt}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 6. OF-5 */}
        <Card 
          title="口腔衰弱五項量表 (OF-5)" 
          score={calculateOF5()} 
          alertCondition={calculateOF5() >= 2} 
          alertText="疑似口腔衰弱 (≥2項為是)"
        >
          <div className="space-y-4">
            {OF5_QUESTIONS.map((q) => (
              <div key={q.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{q.text}</span>
                <div className="flex space-x-4">
                  {q.opts.map(opt => (
                    <label key={opt.label} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg flex-1 justify-center border border-gray-200 hover:bg-blue-50">
                      <input type="radio" name={`of5-${q.id}`} value={opt.val} onChange={() => setOf5({...of5, [q.id]: opt.val})} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7. 口篩表 */}
        <Card title="口篩表">
          <div className="space-y-6">
            
            {/* 牙齒現況 (新增區塊) */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-blue-900">牙齒現況</label>
                <span className="text-xs text-gray-500">左右滑動填寫</span>
              </div>
              <p className="text-xs text-gray-600 mb-3 font-medium">代碼：D=窩洞，M=缺牙，RR=殘根，F=填補</p>
              
              <div className="space-y-4">
                {/* 上顎 */}
                <div>
                  <span className="text-xs font-bold text-gray-600 block mb-1">上顎 (18-28)</span>
                  <div className="flex overflow-x-auto pb-2 space-x-1 snap-x">
                    {UPPER_TEETH.map(t => (
                      <div key={t} className="flex flex-col items-center min-w-[3.5rem] snap-start">
                        <span className="text-xs font-bold text-gray-700">{t}</span>
                        <select
                          className="mt-1 w-full text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-1 focus:ring-blue-500"
                          value={oralScreening.dentalStatus[t] || ''}
                          onChange={(e) => handleDentalStatusChange(t, e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="D">D</option>
                          <option value="M">M</option>
                          <option value="RR">RR</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 下顎 */}
                <div>
                  <span className="text-xs font-bold text-gray-600 block mb-1">下顎 (48-38)</span>
                  <div className="flex overflow-x-auto pb-2 space-x-1 snap-x">
                    {LOWER_TEETH.map(t => (
                      <div key={t} className="flex flex-col items-center min-w-[3.5rem] snap-start">
                        <span className="text-xs font-bold text-gray-700">{t}</span>
                        <select
                          className="mt-1 w-full text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-1 focus:ring-blue-500"
                          value={oralScreening.dentalStatus[t] || ''}
                          onChange={(e) => handleDentalStatusChange(t, e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="D">D</option>
                          <option value="M">M</option>
                          <option value="RR">RR</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 飲食方式 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">飲食方式</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['經口', '鼻胃管', '胃造口', '其它'].map(opt => (
                  <label key={opt} className="flex items-center p-2 border rounded-lg bg-gray-50 cursor-pointer">
                    <input type="radio" name="dietMethod" value={opt} onChange={(e) => setOralScreening({...oralScreening, dietMethod: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 食物型態 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">食物型態</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {['正常', '軟食', '碎食', '泥狀', '其它'].map(opt => (
                  <label key={opt} className="flex items-center p-2 border rounded-lg bg-gray-50 cursor-pointer">
                    <input type="radio" name="foodType" value={opt} onChange={(e) => setOralScreening({...oralScreening, foodType: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 飲食能力 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">飲食能力</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['自行進食', '使用特殊餐具', '輔助餵食', '其它'].map(opt => (
                  <label key={opt} className="flex items-center p-2 border rounded-lg bg-gray-50 cursor-pointer">
                    <input type="radio" name="eatingAbility" value={opt} onChange={(e) => setOralScreening({...oralScreening, eatingAbility: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 假牙使用狀況 */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-3">假牙使用狀況</label>
              
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-600 block mb-2">上顎</span>
                <select className="w-full p-2 border rounded-lg mb-2 bg-white" onChange={(e) => setOralScreening({...oralScreening, upperDenture: e.target.value})}>
                  <option value="">選擇假牙類型</option>
                  <option value="無">無</option>
                  <option value="局部活動">局部活動假牙</option>
                  <option value="全口活動">全口活動假牙</option>
                  <option value="局部固定">局部固定假牙</option>
                  <option value="全口固定">全口固定假牙</option>
                </select>
                <div className="flex space-x-4">
                  {['經常', '偶爾', '其它'].map(opt => (
                    <label key={`up-${opt}`} className="flex items-center text-sm">
                      <input type="radio" name="upperDentureUsage" value={opt} onChange={(e) => setOralScreening({...oralScreening, upperDentureUsage: e.target.value})} className="mr-1" /> {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-600 block mb-2">下顎</span>
                <select className="w-full p-2 border rounded-lg mb-2 bg-white" onChange={(e) => setOralScreening({...oralScreening, lowerDenture: e.target.value})}>
                  <option value="">選擇假牙類型</option>
                  <option value="無">無</option>
                  <option value="局部活動">局部活動假牙</option>
                  <option value="全口活動">全口活動假牙</option>
                  <option value="局部固定">局部固定假牙</option>
                  <option value="全口固定">全口固定假牙</option>
                </select>
                <div className="flex space-x-4">
                  {['經常', '偶爾', '其它'].map(opt => (
                    <label key={`low-${opt}`} className="flex items-center text-sm">
                      <input type="radio" name="lowerDentureUsage" value={opt} onChange={(e) => setOralScreening({...oralScreening, lowerDentureUsage: e.target.value})} className="mr-1" /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 其它口腔疾病與異常 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">其它口腔疾病與異常 (可複選)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['緊咬', '牙齦炎', '牙周病', '口腔黏膜異常', '其它'].map(opt => (
                  <label key={opt} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${oralScreening.otherDiseases.includes(opt) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50'}`}>
                    <input type="checkbox" checked={oralScreening.otherDiseases.includes(opt)} onChange={() => handleDiseaseToggle(opt)} className="w-4 h-4 text-blue-600 mr-2 rounded" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* 底部固定儲存按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="hidden sm:block text-sm text-gray-500">
            請確認所有資料皆已填寫完畢
          </div>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? '資料儲存中...' : '送出評估結果'}
          </button>
        </div>
      </div>
    </div>
  );
}