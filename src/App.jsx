import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// --- 資料定義 ---
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
  '吞嚥問題是否導致我的體重下降',
  '吞嚥是否干擾我外出飲食',
  '吞嚥液狀物需額外費力',
  '吞嚥固狀物需額外費力',
  '吞服藥丸時需額外特別費力',
  '吞嚥是否會導致疼痛',
  '飲食的愉悅是否為吞嚥問題影響',
  '吞嚥食物時會黏著咽喉',
  '吃東西時是否會咳嗽',
  '吞嚥時是否有壓迫感'
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
  { id: 'q1', text: '1. 天然牙齒數量少於 20 顆' },
  { id: 'q2', text: '2. 感覺咀嚼能力比以前變差' },
  { id: 'q3', text: '3. 喝茶或湯時容易嗆到 (吞嚥困難)' },
  { id: 'q4', text: '4. 經常覺得口乾' },
  { id: 'q5', text: '5. 說話時容易發音不清' }
];

const SCREENING_ITEMS = [
  { id: 'upper_denture', label: '上顎假牙狀態', options: ['無假牙', '固定式假牙', '活動式(密合良好)', '活動式(鬆脫/破損)'] },
  { id: 'lower_denture', label: '下顎假牙狀態', options: ['無假牙', '固定式假牙', '活動式(密合良好)', '活動式(鬆脫/破損)'] },
  { id: 'oral_hygiene', label: '口腔清潔度', options: ['良好', '普通', '不佳 (有明顯牙結石/牙菌斑)'] },
  { id: 'mucosa', label: '口腔黏膜異常', options: ['無異常', '白斑 / 紅斑', '潰瘍 / 破皮', '不明腫塊'] }
];

export default function OralHealthAssessment() {
  // --- 狀態管理 ---
  const [patientInfo, setPatientInfo] = useState({ name: '', id: '', date: new Date().toISOString().split('T')[0] });
  
  const [ofi8, setOfi8] = useState({});
  const [eat10, setEat10] = useState({});
  const [tci, setTci] = useState(Array(9).fill(0));
  const [ohat, setOhat] = useState({});
  const [of5, setOf5] = useState({});
  const [screening, setScreening] = useState({});

  // --- 計算分數 ---
  const calculateOFI8 = () => {
    let score = 0;
    OFI8_QUESTIONS.forEach(q => {
      if (ofi8[q.id] === 'yes') score += q.yesScore;
      if (ofi8[q.id] === 'no') score += q.noScore;
    });
    return score;
  };

  const calculateEAT10 = () => {
    return Object.values(eat10).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const calculateTCI = () => {
    const sum = tci.reduce((a, b) => a + b, 0);
    return ((sum / 18) * 100).toFixed(2);
  };

  const calculateOHAT = () => {
    return Object.values(ohat).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const calculateOF5 = () => {
    return Object.values(of5).filter(val => val === 'yes').length;
  };

  // --- 渲染各個表單 ---
  const renderOFI8 = () => (
    <div className="space-y-4 p-1 sm:p-2">
      <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2">口腔衰弱指數8 (OFI-8)</h3>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="font-medium text-blue-800">目前總分：{calculateOFI8()} 分</span>
        {calculateOFI8() >= 4 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 疑似口腔衰弱 (≥4分)</span>}
      </div>
      {OFI8_QUESTIONS.map((q) => (
        <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3 border border-gray-100">
          <span className="text-gray-700 sm:w-3/4 break-words leading-relaxed">{q.id}. {q.text}</span>
          <div className="flex space-x-6 sm:space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer p-1">
              <input type="radio" name={`ofi8-${q.id}`} value="yes" onChange={() => setOfi8({...ofi8, [q.id]: 'yes'})} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500" />
              <span className="text-base sm:text-sm text-gray-700">是</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1">
              <input type="radio" name={`ofi8-${q.id}`} value="no" onChange={() => setOfi8({...ofi8, [q.id]: 'no'})} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500" />
              <span className="text-base sm:text-sm text-gray-700">否</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEAT10 = () => (
    <div className="space-y-4 p-1 sm:p-2">
      <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2">吞嚥困難篩選工具表 (EAT-10)</h3>
      <p className="text-sm text-gray-500">0 = 沒有問題, 4 = 問題很嚴重</p>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="font-medium text-blue-800">目前總分：{calculateEAT10()} 分</span>
        {calculateEAT10() >= 3 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥3分)</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EAT10_QUESTIONS.map((q, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4 break-words">{idx + 1}. {q}</p>
            <div className="flex justify-between px-1 sm:px-2">
              {[0, 1, 2, 3, 4].map(score => (
                <label key={score} className="flex flex-col items-center cursor-pointer p-1">
                  <input type="radio" name={`eat10-${idx}`} value={score} onChange={(e) => setEat10({...eat10, [idx]: e.target.value})} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 mb-1.5" />
                  <span className="text-sm sm:text-xs text-gray-600">{score}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTCI = () => (
    <div className="space-y-4 p-1 sm:p-2 flex flex-col items-center">
      <div className="w-full">
        <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2">舌苔指數 (TCI)</h3>
        <div className="flex items-start sm:items-center text-sm text-gray-600 my-4 bg-blue-50 px-4 py-3 rounded-lg">
          <Info className="w-5 h-5 mr-2 mt-0.5 sm:mt-0 text-blue-500 flex-shrink-0" />
          <p className="break-words">請觀察舌面，0: 無舌苔, 1: 薄舌苔 (可見舌乳突), 2: 厚舌苔 (無法看見舌乳突)。</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-md mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="font-medium text-blue-800">TCI 指數：{calculateTCI()} %</span>
          {parseFloat(calculateTCI()) >= 50 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥50%)</span>}
        </div>
      </div>
      
      {/* 弧形舌頭視覺設計 */}
      <div className="relative mt-4 mb-8">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-medium">舌根 (內部)</div>
        
        <div className="w-64 h-80 bg-pink-100 border-4 border-pink-300 rounded-t-[4rem] rounded-b-[7rem] overflow-hidden grid grid-cols-3 grid-rows-3 shadow-lg relative">
          {tci.map((val, idx) => (
            <div key={idx} className="border border-pink-200 flex items-center justify-center bg-white/30 hover:bg-white/60 transition-colors">
              <select 
                className="block w-14 h-10 text-center text-base font-medium rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900 cursor-pointer appearance-none"
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
        
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-medium">舌尖 (朝外)</div>
      </div>
    </div>
  );

  const renderOHAT = () => (
    <div className="space-y-4 p-1 sm:p-2 w-full">
      <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2">口腔健康評估量表 (OHAT)</h3>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="font-medium text-blue-800">目前總分：{calculateOHAT()} 分</span>
        {calculateOHAT() >= 4 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥4分)</span>}
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">項目</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">0 分 (正常)</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">1 分 (變化)</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">2 分 (不健康)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {OHAT_CATEGORIES.map((cat) => (
              <tr key={cat.id}>
                <td className="px-3 py-3 text-sm font-medium text-gray-900 bg-gray-50 whitespace-nowrap">{cat.name}</td>
                {cat.opts.map((opt, idx) => (
                  <td key={idx} className="px-3 py-3 text-sm text-gray-600 text-center cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setOhat({...ohat, [cat.id]: idx})}>
                    <input type="radio" name={`ohat-${cat.id}`} checked={ohat[cat.id] === idx} readOnly className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 mx-auto block mb-2 cursor-pointer" />
                    <span className="text-xs sm:text-sm leading-tight block break-words">{opt}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOF5AndScreening = () => (
    <div className="space-y-8 p-1 sm:p-2">
      {/* OF-5 區塊 */}
      <div>
        <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">口腔衰弱 5 項目 (OF-5)</h3>
        <div className="bg-blue-50 p-4 rounded-md mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="font-medium text-blue-800">符合項目數：{calculateOF5()} 項</span>
          {calculateOF5() >= 2 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 疑似口腔衰弱 (≥2項)</span>}
        </div>
        <div className="space-y-3">
          {OF5_QUESTIONS.map((q) => (
            <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-3">
              <span className="text-gray-700 break-words leading-relaxed">{q.text}</span>
              <div className="flex space-x-6 sm:space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer p-1">
                  <input type="radio" name={`of5-${q.id}`} value="yes" onChange={() => setOf5({...of5, [q.id]: 'yes'})} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500" />
                  <span className="text-base sm:text-sm text-gray-700">是</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1">
                  <input type="radio" name={`of5-${q.id}`} value="no" onChange={() => setOf5({...of5, [q.id]: 'no'})} className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500" />
                  <span className="text-base sm:text-sm text-gray-700">否</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 口篩表區塊 */}
      <div>
        <h3 className="text-xl font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">一般口腔篩檢表</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCREENING_ITEMS.map((item) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-bold text-gray-800 mb-3">{item.label}</p>
              <div className="space-y-3 sm:space-y-2">
                {item.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center space-x-3 cursor-pointer p-1 sm:p-0">
                    <input 
                      type="radio" 
                      name={`screening-${item.id}`} 
                      value={opt} 
                      onChange={() => setScreening({...screening, [item.id]: opt})}
                      className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500" 
                    />
                    <span className="text-base sm:text-sm text-gray-700 break-words">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-bold text-gray-800 mb-2">其他備註 / 異常描述</label>
          <textarea 
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm p-3 border bg-white text-gray-900 appearance-none" 
            rows="3" 
            placeholder="請輸入其他觀察到的口腔狀況..."
          ></textarea>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-100 font-sans p-2 sm:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sticky top-0 z-10 shadow-md">
          <ClipboardList className="text-white w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate">預防口腔衰弱 - 綜合評估表</h1>
        </div>

        {/* Patient Info */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input 
              type="text" 
              value={patientInfo.name}
              onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm p-2.5 border bg-white text-gray-900 appearance-none placeholder-gray-400" 
              placeholder="輸入姓名" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身分證字號</label>
            <input 
              type="text" 
              value={patientInfo.id}
              onChange={(e) => setPatientInfo({...patientInfo, id: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm p-2.5 border bg-white text-gray-900 appearance-none placeholder-gray-400" 
              placeholder="輸入身分證" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">評估日期</label>
            <input 
              type="date" 
              value={patientInfo.date}
              onChange={(e) => setPatientInfo({...patientInfo, date: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm p-2.5 border bg-white text-gray-900 appearance-none" 
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-3 sm:p-6 space-y-10">
          <section>{renderOFI8()}</section>
          <hr className="border-gray-200" />
          <section>{renderEAT10()}</section>
          <hr className="border-gray-200" />
          <section>{renderTCI()}</section>
          <hr className="border-gray-200" />
          <section>{renderOHAT()}</section>
          <hr className="border-gray-200" />
          <section>{renderOF5AndScreening()}</section>
        </div>
        
        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border-t border-gray-200 flex justify-center sm:justify-end sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 sm:py-2.5 border border-transparent text-lg sm:text-sm font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <CheckCircle2 className="w-6 h-6 sm:w-5 sm:h-5 mr-2" />
            儲存評估結果
          </button>
        </div>
      </div>
    </div>
  );
}