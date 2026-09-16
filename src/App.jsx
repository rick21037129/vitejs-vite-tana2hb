import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, ChevronRight, Save, User, MapPin, Calendar, Stethoscope, Activity, AlertCircle } from 'lucide-react';

// Google Apps Script URL (已替換為您提供的最新網址)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpGSXCqXhbVhpTrWB84LkFBjCBGVFspDfzY4P2TLNx5KAq9stPXhvhB2sqoFqvYlI4/exec';

export default function OralFrailtyAssessment() {
  // --- 狀態管理 ---
  const [step, setStep] = useState(1); // 1: 填寫表單, 2: 總結與送出
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    region: '',
    name: '',
    // OF-5 (0=否, 1=是)
    of5_1: '', of5_2: '', of5_3: '', of5_4: '', of5_5: '',
    // OFI-8 (0=否, 1=是)
    ofi8_1: '', ofi8_2: '', ofi8_3: '', ofi8_4: '', ofi8_5: '', ofi8_6: '', ofi8_7: '', ofi8_8: '',
    // 專業評估
    eat10: 0,
    tci: 0,
    ohat_1: 0, ohat_2: 0, ohat_3: 0, ohat_4: 0, ohat_5: 0, ohat_6: 0, ohat_7: 0, ohat_8: 0
  });

  // --- 錨點 (Refs) 用於自動捲動 ---
  const qRefs = {
    hard_food: useRef(null),
    choking: useRef(null),
    dry_mouth: useRef(null)
  };

  // --- 處理輸入變更 ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === 'true' ? 1 : value === 'false' ? 0 : value
    }));
  };

  const handleScoreChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  // --- 邏輯衝突偵測 ---
  const getConflicts = () => {
    const conflicts = [];
    // 1. 吃硬的食物有困難 (OF-5 Q2 vs OFI-8 Q1)
    if (formData.of5_2 !== '' && formData.ofi8_1 !== '' && formData.of5_2 !== formData.ofi8_1) {
      conflicts.push({ id: 'hard_food', msg: '「吃硬的食物有困難」在 OF-5 與 OFI-8 填寫結果不一致' });
    }
    // 2. 偶爾會嗆到 (OF-5 Q3 vs OFI-8 Q2)
    if (formData.of5_3 !== '' && formData.ofi8_2 !== '' && formData.of5_3 !== formData.ofi8_2) {
      conflicts.push({ id: 'choking', msg: '「偶爾會嗆到」在 OF-5 與 OFI-8 填寫結果不一致' });
    }
    // 3. 經常口乾舌燥 (OF-5 Q4 vs OFI-8 Q4)
    if (formData.of5_4 !== '' && formData.ofi8_4 !== '' && formData.of5_4 !== formData.ofi8_4) {
      conflicts.push({ id: 'dry_mouth', msg: '「經常口乾舌燥」在 OF-5 與 OFI-8 填寫結果不一致' });
    }
    return conflicts;
  };

  const conflicts = getConflicts();
  const hasConflicts = conflicts.length > 0;

  // 點擊衝突項目時，平滑捲動到該題目並稍微偏移以避免被頂部遮擋
  const scrollToQuestion = (id) => {
    if (qRefs[id] && qRefs[id].current) {
      const yOffset = -100; 
      const element = qRefs[id].current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // 加入短暫的高亮動畫效果 (可選)
      element.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
      setTimeout(() => element.classList.remove('bg-yellow-100'), 2000);
    }
  };

  // --- 分數計算 ---
  const calculateScores = () => {
    const of5_score = [formData.of5_1, formData.of5_2, formData.of5_3, formData.of5_4, formData.of5_5].reduce((a, b) => a + (Number(b) || 0), 0);
    const ofi8_score = [formData.ofi8_1, formData.ofi8_2, formData.ofi8_3, formData.ofi8_4, formData.ofi8_5, formData.ofi8_6, formData.ofi8_7, formData.ofi8_8].reduce((a, b) => a + (Number(b) || 0), 0);
    const ohat_score = formData.ohat_1 + formData.ohat_2 + formData.ohat_3 + formData.ohat_4 + formData.ohat_5 + formData.ohat_6 + formData.ohat_7 + formData.ohat_8;
    
    // 找出 OHAT 2分的項目
    const ohatNames = ['唇', '舌', '牙齦與黏膜', '唾液', '自然牙', '假牙', '口腔清潔', '牙痛'];
    const ohat2Points = [];
    for (let i = 1; i <= 8; i++) {
      if (formData[`ohat_${i}`] === 2) {
        ohat2Points.push(ohatNames[i-1]);
      }
    }

    // 評估結果分類
    let riskLevel = '無口腔衰弱';
    if (of5_score >= 2 || ofi8_score >= 4) {
      if (formData.eat10 >= 3 || formData.tci >= 4 || ohat_score >= 4) {
        riskLevel = '高風險';
      } else {
        riskLevel = '低風險';
      }
    }

    return { of5_score, ofi8_score, eat10: formData.eat10, tci: formData.tci, ohat_score, ohat2Points, riskLevel };
  };

  // 姓名遮蔽 (中間字改為Ｏ)
  const maskName = (name) => {
    if (!name) return '';
    if (name.length === 2) return name[0] + 'Ｏ';
    if (name.length > 2) return name[0] + 'Ｏ'.repeat(name.length - 2) + name[name.length - 1];
    return name;
  };

  // --- 送出資料到 Google Sheets ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const scores = calculateScores();
    
    const payload = {
      date: formData.date,
      region: formData.region,
      name: maskName(formData.name),
      of5_score: scores.of5_score,
      ofi8_score: scores.ofi8_score,
      eat10_score: scores.eat10,
      tci_score: scores.tci,
      ohat_score: scores.ohat_score,
      ohat_2_items: scores.ohat2Points.join(', '),
      risk_level: scores.riskLevel
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitSuccess(true);
      setStep(2); // 切換到總結畫面
    } catch (error) {
      console.error('Error:', error);
      alert('上傳失敗，請檢查網路連線。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染 Yes/No 選擇題
  const renderRadio = (name, label) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-700 mb-2 sm:mb-0">{label}</span>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="radio" name={name} value="true" checked={formData[name] === 1} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
          <span>是</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="radio" name={name} value="false" checked={formData[name] === 0} onChange={handleInputChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
          <span>否</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Stethoscope className="mr-2" /> 口腔衰弱評估系統
          </h1>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-8">
              
              {/* 基本資料 */}
              <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" /> 基本資料
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">評估日期</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地區</label>
                    <input type="text" name="region" value={formData.region} onChange={handleInputChange} placeholder="例如：台北市" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="請輸入姓名" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
                  </div>
                </div>
              </section>

              {/* 民眾填寫區 (開放修改) */}
              <section>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-t-lg font-semibold text-center">
                  民眾初步評估 (OF-5 & OFI-8)
                </div>
                <div className="border border-blue-100 rounded-b-lg p-4 space-y-6">
                  
                  {/* OF-5 */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 border-b pb-2">OF-5 量表</h3>
                    {renderRadio('of5_1', '1. 覺得比起半年前，硬的食物變得比較難咬？')}
                    <div ref={qRefs.hard_food} className="rounded-md p-1">{renderRadio('of5_2', '2. 吃硬的食物有困難？')}</div>
                    <div ref={qRefs.choking} className="rounded-md p-1">{renderRadio('of5_3', '3. 喝茶或湯汁等液體時，偶爾會嗆到？')}</div>
                    <div ref={qRefs.dry_mouth} className="rounded-md p-1">{renderRadio('of5_4', '4. 經常覺得口乾舌燥？')}</div>
                    {renderRadio('of5_5', '5. 比起半年前，外出的頻率減少了？')}
                  </div>

                  {/* OFI-8 */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 border-b pb-2 mt-4">OFI-8 量表</h3>
                    <div ref={qRefs.hard_food} className="rounded-md p-1">{renderRadio('ofi8_1', '1. 覺得比起半年前，硬的食物變得比較難咬？')}</div>
                    <div ref={qRefs.choking} className="rounded-md p-1">{renderRadio('ofi8_2', '2. 喝茶或湯汁等液體時，偶爾會嗆到？')}</div>
                    {renderRadio('ofi8_3', '3. 覺得比起半年前，假牙變得比較不合？')}
                    <div ref={qRefs.dry_mouth} className="rounded-md p-1">{renderRadio('ofi8_4', '4. 經常覺得口乾舌燥？')}</div>
                    {renderRadio('ofi8_5', '5. 半年內體重減輕兩公斤以上？')}
                    {renderRadio('ofi8_6', '6. 覺得比起半年前，走路速度變慢了？')}
                    {renderRadio('ofi8_7', '7. 覺得比起半年前，握力變弱了？')}
                    {renderRadio('ofi8_8', '8. 覺得比起半年前，外出的頻率減少了？')}
                  </div>
                </div>
              </section>

              {/* 邏輯衝突警告區塊 */}
              {hasConflicts && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm animate-pulse">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                    <h3 className="text-lg font-bold text-red-700">民眾填寫邏輯衝突提醒</h3>
                  </div>
                  <p className="text-sm text-red-600 mb-3">請點擊下方衝突項目，向民眾確認並修正答案後，才能繼續填寫專業評估。</p>
                  <ul className="space-y-2">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx}>
                        <button 
                          onClick={() => scrollToQuestion(conflict.id)}
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
              )}

              {/* 專業人員填寫區 */}
              <section className={`transition-opacity duration-300 ${hasConflicts ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-t-lg font-semibold text-center flex justify-center items-center">
                  <Stethoscope className="w-5 h-5 mr-2" /> 以下由專業人員填寫
                </div>
                
                {hasConflicts && (
                  <div className="bg-gray-800 text-white text-center py-2 text-sm font-medium">
                    ⚠️ 請先修正上方邏輯衝突，方可解鎖此區塊
                  </div>
                )}

                <div className="border border-indigo-100 rounded-b-lg p-4 space-y-6 bg-white">
                  
                  {/* EAT-10 & TCI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-bold text-gray-800 mb-2">EAT-10 總分 (0-40)</label>
                      <input type="number" min="0" max="40" value={formData.eat10} onChange={(e) => handleScoreChange('eat10', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-800 mb-2">TCI 總分</label>
                      <input type="number" min="0" value={formData.tci} onChange={(e) => handleScoreChange('tci', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" />
                    </div>
                  </div>

                  {/* OHAT */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">OHAT 評估 (0-2分)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['唇', '舌', '牙齦與黏膜', '唾液', '自然牙', '假牙', '口腔清潔', '牙痛'].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <span className="text-gray-700">{idx + 1}. {item}</span>
                          <select 
                            value={formData[`ohat_${idx + 1}`]} 
                            onChange={(e) => handleScoreChange(`ohat_${idx + 1}`, e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 border"
                          >
                            <option value="0">0分</option>
                            <option value="1">1分</option>
                            <option value="2">2分</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 送出按鈕 */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasConflicts || !formData.name}
                  className={`flex items-center px-6 py-3 rounded-lg text-white font-bold text-lg transition-colors shadow-md
                    ${(isSubmitting || hasConflicts || !formData.name) 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSubmitting ? '處理中...' : '送出評估結果'}
                  {!isSubmitting && <ChevronRight className="ml-2 w-5 h-5" />}
                </button>
              </div>
              
              {(!formData.name && !hasConflicts) && (
                <p className="text-red-500 text-sm text-right mt-2">請填寫姓名後方可送出</p>
              )}
            </div>
          )}

          {/* 步驟 2: 總結畫面 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">評估完成並已匯出</h2>
                <p className="text-gray-600 mt-2">資料已成功同步至 Google 試算表</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center border-b border-blue-200 pb-2">
                  <Activity className="mr-2" /> 評估結果摘要
                </h3>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-gray-700 mb-6">
                  <div><span className="font-semibold">評估日期：</span>{formData.date}</div>
                  <div><span className="font-semibold">地區：</span>{formData.region || '未填寫'}</div>
                  <div className="col-span-2"><span className="font-semibold">姓名：</span>{maskName(formData.name)}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
                    <div className="text-sm text-gray-500">OF-5</div>
                    <div className="text-2xl font-bold text-blue-600">{calculateScores().of5_score}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
                    <div className="text-sm text-gray-500">OFI-8</div>
                    <div className="text-2xl font-bold text-blue-600">{calculateScores().ofi8_score}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
                    <div className="text-sm text-gray-500">EAT-10</div>
                    <div className="text-2xl font-bold text-blue-600">{calculateScores().eat10}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
                    <div className="text-sm text-gray-500">TCI</div>
                    <div className="text-2xl font-bold text-blue-600">{calculateScores().tci}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-gray-100">
                    <div className="text-sm text-gray-500">OHAT 總分</div>
                    <div className="text-2xl font-bold text-blue-600">{calculateScores().ohat_score}</div>
                  </div>
                </div>

                {calculateScores().ohat2Points.length > 0 && (
                  <div className="mb-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <span className="font-semibold text-orange-800">OHAT 2分項目：</span>
                    <span className="text-orange-700 ml-2">{calculateScores().ohat2Points.join('、')}</span>
                  </div>
                )}

                <div className={`p-4 rounded-lg text-center font-bold text-xl ${
                  calculateScores().riskLevel === '高風險' ? 'bg-red-100 text-red-700 border border-red-200' :
                  calculateScores().riskLevel === '低風險' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                  'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  評估分類：{calculateScores().riskLevel}
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 font-semibold hover:text-blue-800 underline"
                >
                  開始下一位評估
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}