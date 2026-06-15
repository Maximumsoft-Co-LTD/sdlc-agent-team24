'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = [
  'นิยาย',
  'สารคดี',
  'ธุรกิจ',
  'การพัฒนาตนเอง',
  'วิทยาศาสตร์',
  'ประวัติศาสตร์',
  'ศิลปะ',
  'เด็กและเยาวชน',
  'อื่นๆ',
]

type Step = 1 | 2 | 3 | 4

export default function NewBookPage() {
  const { accessToken } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [bookId, setBookId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    price_buy: '',
    price_rent: '',
  })
  const [formError, setFormError] = useState('')
  const [savingDraft, setSavingDraft] = useState(false)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverDone, setCoverDone] = useState(false)

  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [epubUploading, setEpubUploading] = useState(false)
  const [epubProgress, setEpubProgress] = useState(0)
  const [epubDone, setEpubDone] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const priceBuy = parseFloat(form.price_buy) || 0
  const publisherShare = Math.round(priceBuy * 0.7 * 100) / 100
  const platformShare = Math.round(priceBuy * 0.3 * 100) / 100

  const handleSaveDraft = async () => {
    setFormError('')
    if (!form.title || !form.author || !form.category || !form.price_buy) {
      setFormError('กรุณากรอกข้อมูลที่จำเป็น: ชื่อ, ผู้แต่ง, หมวดหมู่, ราคา')
      return
    }
    setSavingDraft(true)
    const res = await fetch('/api/v1/publisher/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      body: JSON.stringify({
        title: form.title,
        author: form.author,
        description: form.description,
        category: form.category,
        price_buy: parseFloat(form.price_buy),
        price_rent: form.price_rent ? parseFloat(form.price_rent) : undefined,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setBookId(data.id)
      setStep(2)
    } else {
      setFormError(data.error || 'เกิดข้อผิดพลาด')
    }
    setSavingDraft(false)
  }

  const handleUploadCover = async () => {
    if (!coverFile || !bookId) return
    setCoverUploading(true)
    const urlRes = await fetch(`/api/v1/publisher/books/${bookId}/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      body: JSON.stringify({ fileType: 'cover' }),
    })
    const { uploadUrl } = await urlRes.json()
    await fetch(uploadUrl, { method: 'PUT', body: coverFile, headers: { 'Content-Type': coverFile.type } })
    setCoverUploading(false)
    setCoverDone(true)
    setStep(3)
  }

  const handleUploadEpub = async () => {
    if (!epubFile || !bookId) return
    setEpubUploading(true)
    setEpubProgress(0)
    const urlRes = await fetch(`/api/v1/publisher/books/${bookId}/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      body: JSON.stringify({ fileType: 'epub' }),
    })
    const { uploadUrl } = await urlRes.json()
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) setEpubProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error('Upload failed')) }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', epubFile.type || 'application/epub+zip')
      xhr.send(epubFile)
    })
    setEpubUploading(false)
    setEpubDone(true)
    setStep(4)
  }

  const handleSubmitReview = async () => {
    if (!bookId) return
    setSubmitting(true)
    const res = await fetch(`/api/v1/publisher/books/${bookId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
    })
    if (res.ok) setSubmitted(true)
    setSubmitting(false)
  }

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
  const inputStyle = { border: '1.5px solid #DDD1B8', backgroundColor: '#EFE6D2', color: '#2A241C' }

  const stepLabels = ['ข้อมูลหนังสือ', 'อัปโหลดปกหนังสือ', 'อัปโหลด EPUB', 'ส่งให้รีวิว']

  if (submitted)
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-4">&#127881;</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
        >
          ส่งรีวิวสำเร็จ!
        </h2>
        <p className="mb-6" style={{ color: '#5a5142' }}>
          หนังสือของคุณอยู่ระหว่างการรีวิว ทีมงานจะตรวจสอบภายใน 1-3 วันทำการ
        </p>
        <button
          onClick={() => router.push('/publisher/books')}
          className="px-6 py-2 rounded-xl font-medium"
          style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
        >
          กลับไปหน้าหนังสือ
        </button>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={
                step === s
                  ? { backgroundColor: '#BF5A2B', color: '#EFE6D2' }
                  : step > s
                  ? { backgroundColor: '#2F6E54', color: '#EFE6D2' }
                  : { backgroundColor: '#DDD1B8', color: '#6B6253' }
              }
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className="h-0.5 w-8"
                style={{ backgroundColor: step > s ? '#2F6E54' : '#DDD1B8' }}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm" style={{ color: '#6B6253' }}>
          {stepLabels[step - 1]}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
          >
            ข้อมูลหนังสือ
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                ชื่อหนังสือ <span style={{ color: '#BF5A2B' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={inputClass}
                style={inputStyle}
                placeholder="ชื่อหนังสือ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                ผู้แต่ง <span style={{ color: '#BF5A2B' }}>*</span>
              </label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                className={inputClass}
                style={inputStyle}
                placeholder="ชื่อผู้แต่ง"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>คำอธิบาย</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className={inputClass}
                style={inputStyle}
                placeholder="คำอธิบายหนังสือ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                หมวดหมู่ <span style={{ color: '#BF5A2B' }}>*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className={inputClass}
                style={inputStyle}
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                  ราคาซื้อ (บาท) <span style={{ color: '#BF5A2B' }}>*</span>
                </label>
                <input
                  type="number"
                  value={form.price_buy}
                  onChange={e => setForm(f => ({ ...f, price_buy: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="เช่น 199"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#5a5142' }}>
                  ราคาเช่า (บาท) <span className="text-xs" style={{ color: '#6B6253' }}>ไม่บังคับ</span>
                </label>
                <input
                  type="number"
                  value={form.price_rent}
                  onChange={e => setForm(f => ({ ...f, price_rent: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="เช่น 49"
                  min="0"
                />
              </div>
            </div>

            {priceBuy > 0 && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: 'rgba(47,110,84,0.1)', border: '1px solid rgba(47,110,84,0.3)' }}
              >
                <p className="font-medium mb-2" style={{ color: '#2F6E54' }}>
                  สัดส่วนรายได้ (ราคาซื้อ ฿{priceBuy})
                </p>
                <div className="flex gap-4">
                  <div
                    className="flex-1 rounded p-2 text-center"
                    style={{ backgroundColor: '#FBF6EC' }}
                  >
                    <p className="text-xs" style={{ color: '#6B6253' }}>สำนักพิมพ์ได้ 70%</p>
                    <p className="font-bold" style={{ color: '#2F6E54' }}>฿{publisherShare}</p>
                  </div>
                  <div
                    className="flex-1 rounded p-2 text-center"
                    style={{ backgroundColor: '#FBF6EC' }}
                  >
                    <p className="text-xs" style={{ color: '#6B6253' }}>Read24 ได้ 30%</p>
                    <p className="font-bold" style={{ color: '#BF5A2B' }}>฿{platformShare}</p>
                  </div>
                </div>
              </div>
            )}

            {formError && <p className="text-sm" style={{ color: '#BF5A2B' }}>{formError}</p>}

            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="w-full py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {savingDraft ? 'กำลังบันทึก...' : 'บันทึกร่าง และไปขั้นตอนถัดไป'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
          <h2
            className="text-lg font-bold mb-2"
            style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
          >
            อัปโหลดปกหนังสือ
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6B6253' }}>ไฟล์ JPG หรือ PNG ขนาดแนะนำ 400x600px</p>
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center mb-4"
            style={{ borderColor: '#DDD1B8' }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={e => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload" className="cursor-pointer">
              <p className="text-3xl mb-2">&#128444;&#65039;</p>
              <p className="text-sm" style={{ color: '#6B6253' }}>
                {coverFile ? coverFile.name : 'คลิกเพื่อเลือกไฟล์'}
              </p>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#EFE6D2' }}
            >
              ข้ามขั้นตอนนี้
            </button>
            <button
              onClick={handleUploadCover}
              disabled={!coverFile || coverUploading}
              className="flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {coverUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดปก'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
          <h2
            className="text-lg font-bold mb-2"
            style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
          >
            อัปโหลดไฟล์ EPUB
          </h2>
          <p className="text-sm mb-4" style={{ color: '#6B6253' }}>ไฟล์ .epub เท่านั้น</p>
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center mb-4"
            style={{ borderColor: '#DDD1B8' }}
          >
            <input
              type="file"
              accept=".epub,application/epub+zip"
              onChange={e => setEpubFile(e.target.files?.[0] || null)}
              className="hidden"
              id="epub-upload"
            />
            <label htmlFor="epub-upload" className="cursor-pointer">
              <p className="text-3xl mb-2">&#128214;</p>
              <p className="text-sm" style={{ color: '#6B6253' }}>
                {epubFile ? epubFile.name : 'คลิกเพื่อเลือกไฟล์ EPUB'}
              </p>
            </label>
          </div>
          {epubUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1" style={{ color: '#5a5142' }}>
                <span>กำลังอัปโหลด...</span>
                <span>{epubProgress}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ backgroundColor: '#DDD1B8' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${epubProgress}%`, backgroundColor: '#BF5A2B' }}
                />
              </div>
            </div>
          )}
          <button
            onClick={handleUploadEpub}
            disabled={!epubFile || epubUploading}
            className="w-full py-2.5 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
          >
            {epubUploading ? `กำลังอัปโหลด ${epubProgress}%` : 'อัปโหลด EPUB'}
          </button>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#FBF6EC', border: '1px solid #DDD1B8' }}>
          <div className="text-4xl mb-3">&#128203;</div>
          <h2
            className="text-lg font-bold mb-2"
            style={{ fontFamily: "'Trirong', serif", color: '#2A241C' }}
          >
            ส่งให้รีวิว
          </h2>
          <p className="text-sm mb-6" style={{ color: '#5a5142' }}>
            ตรวจสอบข้อมูลแล้ว คลิกเพื่อส่งหนังสือให้ทีมงาน Read24 รีวิว
          </p>
          <div
            className="rounded-lg p-4 text-left mb-6 space-y-1 text-sm"
            style={{ backgroundColor: '#EFE6D2' }}
          >
            <p><span style={{ color: '#6B6253' }}>ชื่อ:</span> <span className="font-medium" style={{ color: '#2A241C' }}>{form.title}</span></p>
            <p><span style={{ color: '#6B6253' }}>ผู้แต่ง:</span> <span className="font-medium" style={{ color: '#2A241C' }}>{form.author}</span></p>
            <p><span style={{ color: '#6B6253' }}>หมวดหมู่:</span> <span className="font-medium" style={{ color: '#2A241C' }}>{form.category}</span></p>
            <p><span style={{ color: '#6B6253' }}>ราคา:</span> <span className="font-medium" style={{ color: '#2A241C' }}>฿{form.price_buy}</span></p>
            <p>
              <span style={{ color: '#6B6253' }}>ปก:</span>{' '}
              <span style={{ color: coverDone ? '#2F6E54' : '#6B6253' }}>
                {coverDone ? 'อัปโหลดแล้ว' : 'ข้าม'}
              </span>
            </p>
            <p>
              <span style={{ color: '#6B6253' }}>EPUB:</span>{' '}
              <span style={{ color: epubDone ? '#2F6E54' : '#BF5A2B' }}>
                {epubDone ? 'อัปโหลดแล้ว' : 'ยังไม่ได้อัปโหลด'}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{ border: '1.5px solid #DDD1B8', color: '#5a5142', backgroundColor: '#EFE6D2' }}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !epubDone}
              className="flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: '#BF5A2B', color: '#EFE6D2' }}
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งให้รีวิว'}
            </button>
          </div>
          {!epubDone && (
            <p className="text-xs mt-2" style={{ color: '#BF5A2B' }}>กรุณาอัปโหลด EPUB ก่อนส่งรีวิว</p>
          )}
        </div>
      )}
    </div>
  )
}
