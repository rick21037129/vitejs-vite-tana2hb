import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function OralHealthAssessment() {
  // --- 狀態管理 ---
  const [patientInfo, setPatientInfo] = useState({ name: '', id: '', date: '' });
  
  const [ofi8, setOfi8] = useState({});
  const [of5, setOf5] = useState({ q1: null, q2: null, q3: null, q4: null, q5: null });
  const [eat10, setEat10] = useState({});
  const [tci, setTci] = useState(Array(9).fill(0));
  const [ohat, setOhat] = useState({});

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

  // --- 渲染各個表單 ---
  const renderOFI8 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">口腔衰弱指數8 (OFI-8)</h3>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex justify-between items-center">
        <span className="font-medium text-blue-800">目前總分：{calculateOFI8()} 分</span>
        {calculateOFI8() >= 4 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 疑似口腔衰弱 (≥4分)</span>}
      </div>
      {OFI8_QUESTIONS.map((q) => (
        <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 sm:w-3/4">{q.id}. {q.text}</span>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name={`ofi8-${q.id}`} value="yes" onChange={() => setOfi8({...ofi8, [q.id]: 'yes'})} className="w-4 h-4 text-blue-600" />
              <span>是</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name={`ofi8-${q.id}`} value="no" onChange={() => setOfi8({...ofi8, [q.id]: 'no'})} className="w-4 h-4 text-blue-600" />
              <span>否</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEAT10 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">吞嚥困難篩選工具表 (EAT-10)</h3>
      <p className="text-sm text-gray-500">0 = 沒有問題, 4 = 問題很嚴重</p>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex justify-between items-center">
        <span className="font-medium text-blue-800">目前總分：{calculateEAT10()} 分</span>
        {calculateEAT10() >= 3 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥3分)</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EAT10_QUESTIONS.map((q, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">{idx + 1}. {q}</p>
            <div className="flex justify-between px-2">
              {[0, 1, 2, 3, 4].map(score => (
                <label key={score} className="flex flex-col items-center cursor-pointer">
                  <input type="radio" name={`eat10-${idx}`} value={score} onChange={(e) => setEat10({...eat10, [idx]: e.target.value})} className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-xs text-gray-500">{score}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTCI = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">舌苔指數 (TCI)</h3>
      <p className="text-sm text-gray-500">將舌頭區分為九宮格。0: 無舌苔, 1: 薄舌苔, 2: 厚舌苔</p>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex justify-between items-center">
        <span className="font-medium text-blue-800">TCI 指數：{calculateTCI()} %</span>
        {parseFloat(calculateTCI()) >= 50 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥50%)</span>}
      </div>
      
      <div className="flex justify-center my-6">
        <div className="grid grid-cols-3 gap-2 w-64 h-64">
          {tci.map((val, idx) => (
            <div key={idx} className="border-2 border-gray-300 rounded-md flex flex-col items-center justify-center bg-pink-50">
              <select 
                className="mt-1 block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1"
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
    </div>
  );

  const renderOHAT = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">口腔健康評估量表 (OHAT)</h3>
      <div className="bg-blue-50 p-4 rounded-md mb-4 flex justify-between items-center">
        <span className="font-medium text-blue-800">目前總分：{calculateOHAT()} 分</span>
        {calculateOHAT() >= 4 && <span className="text-red-600 font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> 異常 (≥4分)</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">項目</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">0 分 (正常)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">1 分 (變化)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">2 分 (不健康)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {OHAT_CATEGORIES.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">{cat.name}</td>
                {cat.opts.map((opt, idx) => (
                  <td key={idx} className="px-4 py-3 text-sm text-gray-500 text-center cursor-pointer hover:bg-blue-50" onClick={() => setOhat({...ohat, [cat.id]: idx})}>
                    <input type="radio" name={`ohat-${cat.id}`} checked={ohat[cat.id] === idx} readOnly className="w-4 h-4 text-blue-600 mx-auto block mb-2" />
                    <span className="text-xs">{opt}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { name: 'OFI-8', content: renderOFI8 },
    { name: 'EAT-10', content: renderEAT10 },
    { name: 'TCI 舌苔', content: renderTCI },
    { name: 'OHAT', content: renderOHAT },
    { name: 'OF-5 & 口篩表', content: () => <div className="p-8 text-center text-gray-500">此處可依相同邏輯擴充 OF-5 與口篩表介面</div> }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center space-x-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">預防口腔衰弱 - 綜合評估表</h1>
        </div>

        {/* Patient Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">姓名</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="輸入姓名" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">身分證字號</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="輸入身分證" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">評估日期</label>
            <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5 whitespace-nowrap px-4',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-900 hover:bg-white/[0.12] hover:text-blue-800'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white p-1',
                    'focus:outline-none'
                  )}
                >
                  {tab.content()}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            儲存評估結果
          </button>
        </div>
      </div>
    </div>
  );
}