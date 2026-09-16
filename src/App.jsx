import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Loader2, User, Stethoscope, KeyRound, ArrowRight, BookOpen, AlertTriangle, Home } from 'lucide-react';

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

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpGSXCqXhbVhpTrWB84LkFBjCBGVFspDfzY4P2TLNx5KAq9stPXhvhB2sqoFqvYlI4/exec';

const Card = ({ id, title, children, score, alertCondition, alertText, icon: Icon }) => (
  <div id={id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
    <div className="bg-blue-800 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        {Icon && <Icon className="w-5 h-5 text-white mr-2" />}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
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

const maskName = (name) => {
  if (!name) return '';
  if (name.length === 1) return name;
  if (name.length === 2) return name[0] + 'Ｏ';
  return name[0] + 'Ｏ'.repeat(name.length - 2) + name[name.length - 1];
};

export default function OralHealthAssessment() {
  const [appMode, setAppMode] = useState('home'); 
  const [handoffCode, setHandoffCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const [patientInfo, setPatientInfo] = useState({ 
    name: '', id: '', date: '', region: '', 
    birthDate: '', identityType: '', 
    assessmentUnit: '花蓮縣牙醫師公會' 
  });
  const [of5, setOf5] = useState({});
  const [ofi8, setOfi8] = useState({});
  const [eat10, setEat10] = useState({});
  const [tci, setTci] = useState(Array(9).fill(0));
  const [ohat, setOhat] = useState({});
  const [provideMaterials, setProvideMaterials] = useState(true); 
  
  const [oralScreening, setOralScreening] = useState({
    dietMethod: '', foodType: '', eatingAbility: '',
    dentalStatus: {}, 
    upperDenture: '', upperDentureUsage: '',
    lowerDenture: '', lowerDentureUsage: '',
    otherDiseases: []
  });

  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPatientFormComplete = 
    patientInfo.name !== '' && patientInfo.id !== '' && 
    patientInfo.region !== '' && patientInfo.date !== '' &&
    patientInfo.birthDate !== '' && patientInfo.identityType !== '' &&
    Object.keys(of5).length === 5 &&
    Object.keys(ofi8).length === 8 &&
    Object.keys(eat10).length === 10;

  const isAssistantFormComplete = 
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

  // --- 邏輯互斥檢查 ---
  const getLogicConflicts = () => {
    const conflicts = [];
    if (of5['q2'] !== undefined && ofi8[1] !== undefined) {
      if ((of5['q2'] === 1 && ofi8[1] === 'no') || (of5['q2'] === 0 && ofi8[1] === 'yes')) {
        conflicts.push({ msg: '「吃硬的食物有困難」在 OF-5 與 OFI-8 填寫結果不一致', targetId: 'of5-container-q2' });
      }
    }
    if (of5['q3'] !== undefined && ofi8[2] !== undefined) {
      if ((of5['q3'] === 1 && ofi8[2] === 'no') || (of5['q3'] === 0 && ofi8[2] === 'yes')) {
        conflicts.push({ msg: '「被茶或湯嗆到」在 OF-5 與 OFI-8 填寫結果不一致', targetId: 'of5-container-q3' });
      }
    }
    if (of5['q4'] !== undefined && ofi8[4] !== undefined) {
      if ((of5['q4'] === 1 && ofi8[4] === 'no') || (of5['q4'] === 0 && ofi8[4] === 'yes')) {
        conflicts.push({ msg: '「經常口乾舌燥」在 OF-5 與 OFI-8 填寫結果不一致', targetId: 'of5-container-q4' });
      }
    }
    return conflicts;
  };
  const logicConflicts = getLogicConflicts();
  const hasConflicts = logicConflicts.length > 0;
  const prevConflictCountRef = useRef(0);

  // 平滑捲動至指定元素 (支援題目高亮或區塊高亮)
  const scrollToElement = (targetId, isCard = false) => {
    const el = document.getElementById(targetId);
    if (el) {
      const yOffset = -100; 
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      if (isCard) {
        el.classList.add('ring-4', 'ring-green-400', 'transition-all', 'duration-1000');
        setTimeout(() => el.classList.remove('ring-4', 'ring-green-400'), 2000);
      } else {
        el.classList.add('bg-yellow-100', 'transition-colors', 'duration-500', 'rounded-lg', 'p-2');
        setTimeout(() => el.classList.remove('bg-yellow-100', 'p-2'), 2000);
      }
    }
  };

  // 1. 助理登入時，若有衝突自動滑動到第一個衝突點
  useEffect(() => {
    if (appMode === 'assistant' && logicConflicts.length > 0) {
      setTimeout(() => {
        scrollToElement(logicConflicts[0].targetId);
      }, 500);
    }
  }, [appMode]); // 僅在 appMode 改變時觸發

  // 2. 監聽衝突數量，當衝突解決(變為0)時，自動滑動到 TCI 區塊
  useEffect(() => {
    if (appMode === 'assistant') {
      const currentCount = logicConflicts.length;
      if (prevConflictCountRef.current > 0 && currentCount === 0) {
        // 衝突剛被完全解決，延遲一下讓畫面更新後滑動
        setTimeout(() => {
          scrollToElement('tci-section', true);
        }, 300);
      }
      prevConflictCountRef.current = currentCount;
    }
  }, [logicConflicts.length, appMode]);

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
      ...prev, dentalStatus: { ...prev.dentalStatus, [tooth]: status }
    }));
  };

  const handleGenerateHandoff = async () => {
    setIsGeneratingCode(true);
    const dataToPass = { patientInfo, of5, ofi8, eat10 };
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveTemp', data: dataToPass })
      });
      const result = await response.json();
      
      if (result.status === 'ok') {
        setHandoffCode(result.code);
        setAppMode('handoff');
        window.scrollTo(0, 0);
      } else {
        alert('產生代碼失敗：' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('網路連線異常，請確認網路狀態後再試一次');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleAssistantLogin = async () => {
    if (inputCode.length !== 3) {
      setLoginError('請輸入完整的3位數代碼');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getTemp', code: inputCode })
      });
      const result = await response.json();
      
      if (result.status === 'ok') {
        const decodedData = result.data;
        if (decodedData.patientInfo) setPatientInfo(decodedData.patientInfo);
        if (decodedData.of5) setOf5(decodedData.of5);
        if (decodedData.ofi8) setOfi8(decodedData.ofi8);
        if (decodedData.eat10) setEat10(decodedData.eat10);
        
        setAppMode('assistant');
        // 這裡不加上 window.scrollTo(0, 0)，交給 useEffect 去判斷是否要滑動到衝突點
      } else {
        setLoginError(result.message || '找不到此代碼的資料，請確認代碼是否正確');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginError('網路連線異常，請確認網路狀態後再試一次');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSave = async () => {
    if (!isAssistantFormComplete || hasConflicts) return;
    setIsSubmitting(true);

    const finalData = {
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

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'submitFinal', data: finalData })
      });
      setAppMode('summary');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error:', error);
      alert('請求已送出！請檢查 Google 試算表是否有新增資料。');
      setAppMode('summary');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (appMode === 'home') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">預防口腔衰弱評估系統</h1>
          <p className="text-gray-500 mb-8">請選擇您的身分以開始操作</p>
          
          <div className="space-y-4">
            <button onClick={() => setAppMode('patient')} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
              <User className="w-6 h-6 mr-3" /> 我是民眾 (開始填寫)
            </button>
            <button onClick={() => setAppMode('assistant_login')} className="w-full py-4 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors">
              <Stethoscope className="w-6 h-6 mr-3" /> 診所助理 (輸入代碼接手)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appMode === 'assistant_login') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center relative">
          <button onClick={() => setAppMode('home')} className="absolute top-4 left-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <Home className="w-6 h-6" />
          </button>
          
          <KeyRound className="w-16 h-16 text-blue-600 mx-auto mb-4 mt-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">助理接手評估</h2>
          <p className="text-gray-600 mb-6">請輸入民眾手機畫面上顯示的 3 位數代碼</p>
          
          <div className="mb-6">
            <input 
              type="text" 
              maxLength={3}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              className="w-48 text-center text-4xl font-bold tracking-widest p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="---"
            />
            {loginError && <p className="text-red-500 text-sm mt-2 font-medium">{loginError}</p>}
          </div>

          <button 
            onClick={handleAssistantLogin} 
            disabled={isLoggingIn}
            className={`w-full py-4 font-bold rounded-xl flex items-center justify-center transition-colors ${isLoggingIn ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {isLoggingIn ? '載入中...' : <>載入資料 <ArrowRight className="w-5 h-5 ml-2" /></>}
          </button>
        </div>
      </div>
    );
  }

  if (appMode === 'handoff') {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">第一階段填寫完成！</h2>
          <p className="text-gray-600 mb-6">請將下方代碼告訴診所助理，以便進行後續專業評估。</p>
          
          <div className="bg-blue-50 py-8 px-4 border-2 border-dashed border-blue-300 rounded-xl mb-8">
            <span className="block text-sm text-blue-600 font-bold mb-2">您的專屬交接代碼</span>
            <span className="text-6xl font-black text-blue-800 tracking-widest">{handoffCode}</span>
          </div>

          <button onClick={() => setAppMode('patient')} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            返回修改資料
          </button>
        </div>
      </div>
    );
  }

  if (appMode === 'summary') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`px-6 py-8 text-center ${!isSuspectedFrailty ? 'bg-green-600' : isHighRisk ? 'bg-red-600' : 'bg-yellow-500'}`}>
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">評估已完成</h1>
            <p className="text-white/90 text-lg">{finalResult}</p>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">評估紀錄總結</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="block text-sm text-gray-500 mb-1">地區</span>
                <span className="font-bold text-gray-800">{patientInfo.region}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="block text-sm text-gray-500 mb-1">姓名</span>
                <span className="font-bold text-gray-800">{maskName(patientInfo.name)}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mt-6 border-b pb-2">各項分數</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <span className="block text-sm text-blue-800 mb-1">OF-5</span>
                <span className="text-2xl font-bold text-blue-900">{calculateOF5()}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <span className="block text-sm text-blue-800 mb-1">OFI-8</span>
                <span className="text-2xl font-bold text-blue-900">{calculateOFI8()}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <span className="block text-sm text-blue-800 mb-1">EAT-10</span>
                <span className="text-2xl font-bold text-blue-900">{eat10Score}</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <span className="block text-sm text-blue-800 mb-1">TCI</span>
                <span className="text-2xl font-bold text-blue-900">{tciScore}%</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <span className="block text-sm text-blue-800 mb-1">OHAT</span>
                <span className="text-2xl font-bold text-blue-900">{ohatScore}</span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <span className="block text-sm text-red-800 mb-1 font-bold">OHAT 達 2 分之項目</span>
              <span className="text-red-900 font-medium">
                {ohatItemsWith2.length > 0 ? ohatItemsWith2.join('、') : '無'}
              </span>
            </div>
            <button onClick={() => window.location.reload()} className="w-full mt-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">
              返回首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="bg-blue-900 shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setAppMode('home')} className="mr-3 p-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white">預防口腔衰弱評估</h1>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center">
            {appMode === 'patient' ? <><User className="w-4 h-4 mr-1"/> 民眾自填</> : <><Stethoscope className="w-4 h-4 mr-1"/> 專業評估</>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* --- 第一部分：民眾自填區塊 --- */}
        <Card title="基本資料" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">評估單位 (固定)</label>
              <input type="text" value={patientInfo.assessmentUnit} readOnly className="block w-full rounded-lg border-gray-300 bg-gray-200 text-gray-600 border p-3 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">評估日期</label>
              <input type="date" value={patientInfo.date} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, date: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 focus:ring-2 focus:ring-blue-500 disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
              <select value={patientInfo.region} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, region: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 disabled:opacity-70">
                <option value="">請選擇地區</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input type="text" value={patientInfo.name} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 disabled:opacity-70" placeholder="輸入姓名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號</label>
              <input type="text" value={patientInfo.id} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, id: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 disabled:opacity-70" placeholder="輸入身分證" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
              <input type="date" value={patientInfo.birthDate} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, birthDate: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身分別</label>
              <select value={patientInfo.identityType} disabled={appMode === 'assistant'} onChange={(e) => setPatientInfo({...patientInfo, identityType: e.target.value})} className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-3 disabled:opacity-70">
                <option value="">請選擇身分別</option>
                <option value="符合健保法免部分負擔">符合健保法免部分負擔</option>
                <option value="一般個案">一般個案</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 邏輯互斥警告區塊 (移至上方，讓助理一進來就看到) */}
        {appMode === 'assistant' && hasConflicts && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-pulse mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3 shrink-0" />
              <div className="w-full">
                <h3 className="text-red-800 font-bold mb-2">民眾填寫邏輯衝突提醒</h3>
                <p className="text-sm text-red-600 mb-3">請點擊下方項目，向民眾確認並修正答案後，才能解鎖後續評估。</p>
                <ul className="space-y-2">
                  {logicConflicts.map((conflict, idx) => (
                    <li key={idx}>
                      <button 
                        onClick={() => scrollToElement(conflict.targetId)}
                        className="flex items-center text-left w-full text-red-700 hover:bg-red-100 p-2 rounded-md transition-colors"
                      >
                        <span className="mr-2">•</span>
                        <span className="underline decoration-red-300 underline-offset-2">{conflict.msg}</span>
                        <span className="ml-auto text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">點此修正</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Card title="口腔衰弱五項量表 (OF-5)" score={calculateOF5()} alertCondition={calculateOF5() >= 2} alertText="異常 (≥2項為是)">
          <div className="space-y-4">
            {OF5_QUESTIONS.map((q) => (
              <div key={q.id} id={`of5-container-${q.id}`} className="flex flex-col pb-4 border-b border-gray-100 last:border-0 transition-all">
                <span className="text-sm text-gray-800 mb-3 font-medium">{q.text}</span>
                <div className="flex space-x-4">
                  {q.opts.map(opt => (
                    <label key={opt.label} className={`flex items-center space-x-2 px-4 py-2 rounded-lg flex-1 justify-center border transition-colors cursor-pointer hover:bg-blue-50 ${of5[q.id] === opt.val ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <input type="radio" name={`of5-${q.id}`} value={opt.val} checked={of5[q.id] === opt.val} onChange={() => setOf5({...of5, [q.id]: opt.val})} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="口腔衰弱指數8 (OFI-8)" score={calculateOFI8()} alertCondition={calculateOFI8() >= 4} alertText="異常 (≥4分)">
          <div className="space-y-4">
            {OFI8_QUESTIONS.map((q) => (
               <div key={q.id} id={`ofi8-container-${q.id}`} className="flex flex-col pb-4 border-b border-gray-100 last:border-0 transition-all">
                 <span className="text-sm text-gray-800 mb-3 font-medium">{q.id}. {q.text}</span>
                 <div className="flex space-x-6">
                   <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg flex-1 justify-center border transition-colors cursor-pointer hover:bg-blue-50 ${ofi8[q.id] === 'yes' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                     <input type="radio" name={`ofi8-${q.id}`} value="yes" checked={ofi8[q.id] === 'yes'} onChange={() => setOfi8({...ofi8, [q.id]: 'yes'})} className="w-4 h-4 text-blue-600" />
                     <span className="text-sm font-medium">是</span>
                   </label>
                   <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg flex-1 justify-center border transition-colors cursor-pointer hover:bg-blue-50 ${ofi8[q.id] === 'no' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                     <input type="radio" name={`ofi8-${q.id}`} value="no" checked={ofi8[q.id] === 'no'} onChange={() => setOfi8({...ofi8, [q.id]: 'no'})} className="w-4 h-4 text-blue-600" />
                     <span className="text-sm font-medium">否</span>
                   </label>
                 </div>
               </div>
            ))}
          </div>
        </Card>

        <Card title="吞嚥困難篩選 (EAT-10)" score={eat10Score} alertCondition={eat10Score >= 3} alertText="異常 (≥3分)">
          <p className="text-xs text-gray-500 mb-4">0 = 沒有問題, 4 = 問題很嚴重</p>
          <div className="space-y-5">
            {EAT10_QUESTIONS.map((q, idx) => (
              <div key={idx} className="flex flex-col pb-4 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-800 mb-3 font-medium">{idx + 1}. {q}</span>
                <div className="flex justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {[0, 1, 2, 3, 4].map(score => (
                    <label key={score} className={`flex flex-col items-center p-2 rounded-md flex-1 transition-colors cursor-pointer hover:bg-blue-100 ${eat10[idx] === String(score) ? 'bg-blue-200 shadow-sm' : ''}`}>
                      <input type="radio" name={`eat10-${idx}`} value={score} checked={eat10[idx] === String(score)} onChange={(e) => setEat10({...eat10, [idx]: e.target.value})} className="w-4 h-4 text-blue-600 mb-1" />
                      <span className={`text-xs font-medium ${eat10[idx] === String(score) ? 'text-blue-800' : 'text-gray-600'}`}>{score}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* --- 助理模式才顯示的內容 --- */}
        {appMode === 'assistant' && (
          <div className="mt-8 pt-6 border-t-4 border-blue-200 space-y-6">
            <div className="flex items-center justify-center bg-blue-100 text-blue-800 py-2 rounded-lg font-bold mb-4">
              <Stethoscope className="w-5 h-5 mr-2" /> 以下由專業人員填寫
            </div>

            {/* 專業評估區塊 (若有衝突則鎖定) */}
            <div className={`space-y-6 transition-opacity duration-300 ${hasConflicts ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              
              {hasConflicts && (
                <div className="bg-gray-800 text-white text-center py-2 rounded-lg text-sm font-medium">
                  ⚠️ 請先修正上方邏輯衝突，方可解鎖此區塊
                </div>
              )}

              {/* 初步評估結論區塊 */}
              <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${isSuspectedFrailty ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'}`}>
                <div>
                  <h3 className={`text-lg font-bold ${isSuspectedFrailty ? 'text-yellow-800' : 'text-green-800'}`}>初步評估結論</h3>
                  <p className={`text-sm mt-1 ${isSuspectedFrailty ? 'text-yellow-700' : 'text-green-700'}`}>
                    {isSuspectedFrailty ? 'OF-5 ≥ 2 或 OFI-8 ≥ 4，判定為「疑似口腔衰弱」。請繼續完成下方評估以確認風險等級。' : '目前指標正常，無明顯口腔衰弱跡象。仍可繼續完成下方評估。'}
                  </p>
                </div>
              </div>

              {/* 5. TCI */}
              <Card id="tci-section" title="舌苔指數 (TCI)" score={`${tciScore}%`} alertCondition={tciScore >= 50} alertText="異常 (≥50%)">
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
                            <div key={t} className="flex flex-col items-center min-w-14 snap-start">
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
                            <div key={t} className="flex flex-col items-center min-w-14 snap-start">
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

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between opacity-90">
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-green-900 font-bold">提供口腔機能促進練習教材 (固定)</h3>
                    <p className="text-green-700 text-sm mt-0.5">預設已提供衛教教材給個案</p>
                  </div>
                </div>
                <input type="checkbox" checked={provideMaterials} readOnly className="w-6 h-6 text-green-600 rounded cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 底部固定按鈕區 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {appMode === 'patient' && (
            <>
              <div className="text-sm font-medium text-center sm:text-left w-full sm:w-auto">
                {isPatientFormComplete ? (
                  <span className="text-green-600 flex items-center justify-center sm:justify-start">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 民眾填寫部分已完成
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center justify-center sm:justify-start">
                    <AlertCircle className="w-4 h-4 mr-1" /> 請完成所有必填項目
                  </span>
                )}
              </div>
              <button 
                onClick={handleGenerateHandoff}
                disabled={!isPatientFormComplete || isGeneratingCode}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white transition-colors ${
                  isPatientFormComplete && !isGeneratingCode ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isGeneratingCode ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <KeyRound className="w-5 h-5 mr-2" />}
                {isGeneratingCode ? '產生中...' : '產生 3 位數交接代碼'}
              </button>
            </>
          )}

          {appMode === 'assistant' && (
            <>
              <div className="text-sm font-medium text-center sm:text-left w-full sm:w-auto">
                {hasConflicts ? (
                  <span className="text-red-500 flex items-center justify-center sm:justify-start font-bold">
                    <AlertTriangle className="w-4 h-4 mr-1" /> 請先修正民眾填寫邏輯衝突
                  </span>
                ) : isAssistantFormComplete ? (
                  <span className="text-green-600 flex items-center justify-center sm:justify-start">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 專業評估部分已完成
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center justify-center sm:justify-start">
                    <AlertCircle className="w-4 h-4 mr-1" /> 助理請完成所有評估項目
                  </span>
                )}
              </div>
              <button 
                onClick={handleSave}
                disabled={!isAssistantFormComplete || isSubmitting || hasConflicts}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white transition-colors ${
                  isAssistantFormComplete && !isSubmitting && !hasConflicts ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                {isSubmitting ? '資料儲存中...' : '送出完整評估結果'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}