import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Loader2, ChevronDown, ArrowRight, BookOpen } from 'lucide-react';

// --- 資料定義 ---
const REGIONS = [
  '花蓮市', '吉安鄉', '新城鄉', '秀林鄉', '壽豐鄉', 
  '鳳林鎮', '萬榮鄉', '光復鄉', '卓溪鄉', '豐濱鄉', 
  '瑞穗鄉', '玉里鎮', '富里鄉'
];

const OF5_QUESTIONS = [
  { id: 'q1', text: '您的天然牙齒還剩下多少顆？', opts: [{label: '0-19 顆', val: 1}, {label: '≧ 20 顆', val: 0}] },
  { id: 'q2', text: '與6個月前相比，您吃硬的食物是否有困難？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q3', text: '您最近是否被茶或湯嗆到了？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q4', text: '您是否經常感到口乾？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
  { id: 'q5', text: '您最近在發音清晰度方面是否感到困難，或發「ta」音的速度異常？', opts: [{label: '是', val: 1}, {label: '否', val: 0}] },
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

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

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

export default function OralHealthAssessment() {
  // --- 狀態管理 ---
  const [patientInfo, setPatientInfo] = useState({ 
    name: '', id: '', date: '', region: '', 
    birthDate: '', identityType: '', 
    assessmentUnit: '花蓮縣牙醫師公會' // 更新：固定帶入花蓮縣牙醫師公會
  });
  const [of5, setOf5] = useState({});
  const [ofi8, setOfi8] = useState({});
  const [eat10, setEat10] = useState({});
  const [tci, setTci] = useState(Array(9).fill(0));
  const [ohat, setOhat] = useState({});
  const [provideMaterials, setProvideMaterials] = useState(true); // 更新：預設為 true (已提供)
  
  const [oralScreening, setOralScreening] = useState({
    dietMethod: '', foodType: '', eatingAbility: '',
    dentalStatus: {}, 
    upperDenture: '', upperDentureUsage: '',
    lowerDenture: '', lowerDentureUsage: '',
    otherDiseases: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // --- 檢查表單是否填寫完畢 ---
  const isFormComplete = 
    patientInfo.name !== '' && 
    patientInfo.id !== '' && 
    patientInfo.region !== '' && 
    patientInfo.date !== '' &&
    patientInfo.birthDate !== '' &&
    patientInfo.identityType !== '' &&
    Object.keys(of5).length === 5 &&
    Object.keys(ofi8).length === 8 &&
    Object.keys(eat10).length === 10 &&
    Object.keys(ohat).length === 8 &&
    oralScreening.dietMethod !== '' &&
    oralScreening.foodType !== '' &&
    oralScreening.eatingAbility !== '';

  const calculateOF5 = () => Object.values(of5).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
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

  const getOhatItemsWith2 = () => OHAT_CATEGORIES.filter(cat => ohat[cat.id] === 2).map(cat => cat.name);
  const isSuspectedFrailty = calculateOF5() >= 2 || calculateOFI8() >= 4;
  const eat10Score = calculateEAT10();
  const tciScore = parseFloat(calculateTCI());
  const ohatScore = calculateOHAT();
  const ohatItemsWith2 = getOhatItemsWith2();
  const isHighRisk = eat10Score >= 3 && tciScore >= 50 && (ohatScore >= 4 || ohatItemsWith2.length > 0);

  let finalResult = !isSuspectedFrailty ? '無口腔衰弱' : isHighRisk ? '高風險個案 (疑似口腔衰弱)' : '低風險個案 (疑似口腔衰弱)';

  const handleDiseaseToggle = (disease) => {
    setOralScreening(prev => {
      const current = prev.otherDiseases;
      return current.includes(disease) 
        ? { ...prev, otherDiseases: current.filter(d => d !== disease) }
        : { ...prev, otherDiseases: [...current, disease] };
    });
  };

  const handleDentalStatusChange = (tooth, status) => {
    setOralScreening(prev => ({
      ...prev,
      dentalStatus: { ...prev.dentalStatus, [tooth]: status }
    }));
  };

  // --- 儲存資料 ---
  const handleSave = async () => {
    if (!isFormComplete) return;
    setIsSubmitting(true);

    const payload = {
      name: patientInfo.name,
      idNumber: patientInfo.id,
      region: patientInfo.region,      
      result: finalResult,  
      birthDate: patientInfo.birthDate,
      identityType: patientInfo.identityType,
      assessmentDate: patientInfo.date,
      assessmentUnit: patientInfo.assessmentUnit,
      ofi8Score: calculateOFI8(),
      of5Score: calculateOF5(),
      eat10Score: eat10Score,
      oralScreeningCompleted: "完成",
      tciScore: tciScore,
      ohatScore: ohatScore,
      materialsProvided: provideMaterials ? "是" : "否",
      rawDetails: JSON.stringify(oralScreening)
    };

    // ⚠️ 請將此 URL 替換為您新的 Google Apps Script 部署網址
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpGSXCqXhbVhpTrWB84LkFBjCBGVFspDfzY4P2TLNx5KAq9stPXhvhB2sqoFqvYlI4/exec';

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      setShowSummary(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error:', error);
      alert('請求已送出！請檢查 Google 試算表是否有新增資料。');
      setShowSummary(true);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`px-6 py-8 text-center ${!isSuspectedFrailty ? 'bg-green-600' : isHighRisk ? 'bg-red-600' : 'bg-yellow-500'}`}>
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">評估已完成</h1>
            <p className="text-white/90 text-lg">{finalResult}</p>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">
              返回建立新評估
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="bg-blue-900 shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
          <ClipboardList className="w-6 h-6 text-white mr-3" />
          <h1 className="text-xl font-bold text-white">預防口腔衰弱評估</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* 1. 基本資料 */}
        <Card title="基本資料">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">評估單位 (固定)</label>
              <input 
                type="text" 
                value={patientInfo.assessmentUnit}
                readOnly
                className="block w-full rounded-lg border-gray-300 bg-gray-200 text-gray-600 border p-3 cursor-not-allowed" 
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
              <div className="relative">
                <select 
                  value={patientInfo.region}
                  onChange={(e) => setPatientInfo({...patientInfo, region: e.target.value})}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 appearance-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
              <input 
                type="date" 
                value={patientInfo.birthDate}
                onChange={(e) => setPatientInfo({...patientInfo, birthDate: e.target.value})}
                className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身分別</label>
              <div className="relative">
                <select 
                  value={patientInfo.identityType}
                  onChange={(e) => setPatientInfo({...patientInfo, identityType: e.target.value})}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 appearance-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">請選擇身分別</option>
                  <option value="符合健保法免部分負擔">符合健保法免部分負擔</option>
                  <option value="一般個案">一般個案</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. OF-5 */}
        <Card title="口腔衰弱五項量表 (OF-5)" score={calculateOF5()} alertCondition={calculateOF5() >= 2} alertText="異常 (≥2項為是)">
          <div className="space-y-4">
            {OF5_QUESTIONS.map((q) => (
              <div key={q.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{q.text}</span>
                <div className="flex space-x-4">
                  {q.opts.map(opt => (
                    <label key={opt.label} className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg flex-1 justify-center border transition-colors ${of5[q.id] === opt.val ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'}`}>
                      <input type="radio" name={`of5-${q.id}`} value={opt.val} checked={of5[q.id] === opt.val} onChange={() => setOf5({...of5, [q.id]: opt.val})} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. OFI-8 */}
        <Card title="口腔衰弱指數8 (OFI-8)" score={calculateOFI8()} alertCondition={calculateOFI8() >= 4} alertText="異常 (≥4分)">
          <div className="space-y-4">
            {OFI8_QUESTIONS.map((q) => (
               <div key={q.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                 <span className="text-sm text-gray-800 mb-3 font-medium">{q.id}. {q.text}</span>
                 <div className="flex space-x-6">
                   <label className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg flex-1 justify-center border transition-colors ${ofi8[q.id] === 'yes' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'}`}>
                     <input type="radio" name={`ofi8-${q.id}`} value="yes" checked={ofi8[q.id] === 'yes'} onChange={() => setOfi8({...ofi8, [q.id]: 'yes'})} className="w-4 h-4 text-blue-600" />
                     <span className="text-sm font-medium">是</span>
                   </label>
                   <label className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg flex-1 justify-center border transition-colors ${ofi8[q.id] === 'no' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'}`}>
                     <input type="radio" name={`ofi8-${q.id}`} value="no" checked={ofi8[q.id] === 'no'} onChange={() => setOfi8({...ofi8, [q.id]: 'no'})} className="w-4 h-4 text-blue-600" />
                     <span className="text-sm font-medium">否</span>
                   </label>
                 </div>
               </div>
            ))}
          </div>
        </Card>

        {/* 初步評估結論區塊 */}
        <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${isSuspectedFrailty ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'}`}>
          <div>
            <h3 className={`text-lg font-bold ${isSuspectedFrailty ? 'text-yellow-800' : 'text-green-800'}`}>初步評估結論</h3>
            <p className={`text-sm mt-1 ${isSuspectedFrailty ? 'text-yellow-700' : 'text-green-700'}`}>
              {isSuspectedFrailty ? 'OF-5 ≥ 2 或 OFI-8 ≥ 4，判定為「疑似口腔衰弱」。請繼續完成下方評估以確認風險等級。' : '目前指標正常，無明顯口腔衰弱跡象。仍可繼續完成下方評估。'}
            </p>
          </div>
          <ArrowRight className={`w-8 h-8 hidden sm:block ${isSuspectedFrailty ? 'text-yellow-500' : 'text-green-500'}`} />
        </div>

        {/* 4. EAT-10 */}
        <Card title="吞嚥困難篩選 (EAT-10)" score={eat10Score} alertCondition={eat10Score >= 3} alertText="異常 (≥3分)">
          <p className="text-xs text-gray-500 mb-4">0 = 沒有問題, 4 = 問題很嚴重</p>
          <div className="space-y-5">
            {EAT10_QUESTIONS.map((q, idx) => (
              <div key={idx} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{idx + 1}. {q}</span>
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {[0, 1, 2, 3, 4].map(score => (
                    <label key={score} className={`flex flex-col items-center cursor-pointer p-2 rounded-md flex-1 transition-colors ${eat10[idx] === String(score) ? 'bg-blue-200 shadow-sm' : 'hover:bg-blue-100'}`}>
                      <input type="radio" name={`eat10-${idx}`} value={score} checked={eat10[idx] === String(score)} onChange={(e) => setEat10({...eat10, [idx]: e.target.value})} className="w-4 h-4 text-blue-600 mb-1" />
                      <span className={`text-xs font-medium ${eat10[idx] === String(score) ? 'text-blue-800' : 'text-gray-600'}`}>{score}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. TCI */}
        <Card title="舌苔指數 (TCI)" score={`${tciScore}%`} alertCondition={tciScore >= 50} alertText="異常 (≥50%)">
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

        {/* 6. OHAT */}
        <Card title="口腔健康評估 (OHAT)" score={ohatScore} alertCondition={ohatScore >= 4 || ohatItemsWith2.length > 0} alertText="異常 (總分≥4分 或 單項達2分)">
          <div className="space-y-6">
            {OHAT_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-blue-900 mb-3 font-bold bg-blue-50 inline-block px-3 py-1 rounded-md self-start">{cat.name}</span>
                <div className="space-y-2">
                  {cat.opts.map((opt, idx) => (
                    <label key={idx} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${ohat[cat.id] === idx ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                      <input type="radio" name={`ohat-${cat.id}`} checked={ohat[cat.id] === idx} onChange={() => setOhat({...ohat, [cat.id]: idx})} className="mt-0.5 w-4 h-4 text-blue-600 mr-3 shrink-0" />
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${ohat[cat.id] === idx ? 'text-blue-900' : 'text-gray-800'}`}>{idx} 分</span>
                        <span className="text-xs text-gray-500 mt-1">{opt}</span>
                      </div>
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
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-blue-900">牙齒現況</label>
                <span className="text-xs text-gray-500">左右滑動填寫</span>
              </div>
              <p className="text-xs text-gray-600 mb-3 font-medium">代碼：D=窩洞，M=缺牙，RR=殘根，F=填補</p>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-gray-600 block mb-1">上顎 (18-28)</span>
                  <div className="flex overflow-x-auto pb-2 space-x-1 snap-x">
                    {UPPER_TEETH.map(t => (
                      <div key={t} className="flex flex-col items-center min-w-[3.5rem] snap-start">
                        <span className="text-xs font-bold text-gray-700">{t}</span>
                        <select className="mt-1 w-full text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-1 focus:ring-blue-500" value={oralScreening.dentalStatus[t] || ''} onChange={(e) => handleDentalStatusChange(t, e.target.value)}>
                          <option value="">-</option><option value="D">D</option><option value="M">M</option><option value="RR">RR</option><option value="F">F</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-600 block mb-1">下顎 (48-38)</span>
                  <div className="flex overflow-x-auto pb-2 space-x-1 snap-x">
                    {LOWER_TEETH.map(t => (
                      <div key={t} className="flex flex-col items-center min-w-[3.5rem] snap-start">
                        <span className="text-xs font-bold text-gray-700">{t}</span>
                        <select className="mt-1 w-full text-xs border border-gray-300 rounded p-1.5 bg-white focus:ring-1 focus:ring-blue-500" value={oralScreening.dentalStatus[t] || ''} onChange={(e) => handleDentalStatusChange(t, e.target.value)}>
                          <option value="">-</option><option value="D">D</option><option value="M">M</option><option value="RR">RR</option><option value="F">F</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">飲食方式</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['經口', '鼻胃管', '胃造口', '其它'].map(opt => (
                  <label key={opt} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${oralScreening.dietMethod === opt ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="radio" name="dietMethod" value={opt} checked={oralScreening.dietMethod === opt} onChange={(e) => setOralScreening({...oralScreening, dietMethod: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">食物型態</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {['正常', '軟食', '碎食', '泥狀', '其它'].map(opt => (
                  <label key={opt} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${oralScreening.foodType === opt ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="radio" name="foodType" value={opt} checked={oralScreening.foodType === opt} onChange={(e) => setOralScreening({...oralScreening, foodType: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">飲食能力</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['自行進食', '使用特殊餐具', '輔助餵食', '其它'].map(opt => (
                  <label key={opt} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${oralScreening.eatingAbility === opt ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="radio" name="eatingAbility" value={opt} checked={oralScreening.eatingAbility === opt} onChange={(e) => setOralScreening({...oralScreening, eatingAbility: e.target.value})} className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-3">假牙使用狀況</label>
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-600 block mb-2">上顎</span>
                <select className="w-full p-2 border rounded-lg mb-2 bg-white" value={oralScreening.upperDenture} onChange={(e) => setOralScreening({...oralScreening, upperDenture: e.target.value})}>
                  <option value="">選擇假牙類型</option><option value="無">無</option><option value="局部活動">局部活動假牙</option><option value="全口活動">全口活動假牙</option><option value="局部固定">局部固定假牙</option><option value="全口固定">全口固定假牙</option>
                </select>
                <div className="flex space-x-4">
                  {['經常', '偶爾', '其它'].map(opt => (
                    <label key={`up-${opt}`} className="flex items-center text-sm cursor-pointer">
                      <input type="radio" name="upperDentureUsage" value={opt} checked={oralScreening.upperDentureUsage === opt} onChange={(e) => setOralScreening({...oralScreening, upperDentureUsage: e.target.value})} className="mr-1 text-blue-600" /> 
                      <span className={oralScreening.upperDentureUsage === opt ? 'text-blue-700 font-bold' : 'text-gray-700'}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-600 block mb-2">下顎</span>
                <select className="w-full p-2 border rounded-lg mb-2 bg-white" value={oralScreening.lowerDenture} onChange={(e) => setOralScreening({...oralScreening, lowerDenture: e.target.value})}>
                  <option value="">選擇假牙類型</option><option value="無">無</option><option value="局部活動">局部活動假牙</option><option value="全口活動">全口活動假牙</option><option value="局部固定">局部固定假牙</option><option value="全口固定">全口固定假牙</option>
                </select>
                <div className="flex space-x-4">
                  {['經常', '偶爾', '其它'].map(opt => (
                    <label key={`low-${opt}`} className="flex items-center text-sm cursor-pointer">
                      <input type="radio" name="lowerDentureUsage" value={opt} checked={oralScreening.lowerDentureUsage === opt} onChange={(e) => setOralScreening({...oralScreening, lowerDentureUsage: e.target.value})} className="mr-1 text-blue-600" /> 
                      <span className={oralScreening.lowerDentureUsage === opt ? 'text-blue-700 font-bold' : 'text-gray-700'}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">其它口腔疾病與異常 (可複選)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {['緊咬', '牙齦炎', '牙周病', '口腔黏膜異常', '其它'].map(opt => (
                  <label key={opt} className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${oralScreening.otherDiseases.includes(opt) ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="checkbox" checked={oralScreening.otherDiseases.includes(opt)} onChange={() => handleDiseaseToggle(opt)} className="w-4 h-4 text-blue-600 mr-2 rounded" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 8. 衛教與教材提供 (固定帶入已提供) */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between opacity-90">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-green-900 font-bold">提供口腔機能促進練習教材 (固定)</h3>
              <p className="text-green-700 text-sm mt-0.5">預設已提供衛教教材給個案</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={provideMaterials} 
            readOnly
            className="w-6 h-6 text-green-600 rounded cursor-not-allowed" 
          />
        </div>

      </div>

      {/* 底部固定儲存按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm font-medium text-center sm:text-left w-full sm:w-auto">
            {isFormComplete ? (
              <span className="text-green-600 flex items-center justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 mr-1" /> 所有必填資料皆已完成
              </span>
            ) : (
              <span className="text-red-500 flex items-center justify-center sm:justify-start">
                <AlertCircle className="w-4 h-4 mr-1" /> 請完成所有必填項目以送出
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={!isFormComplete || isSubmitting}
            className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isFormComplete ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            {isSubmitting ? '資料儲存中...' : '送出評估結果'}
          </button>
        </div>
      </div>
    </div>
  );
}