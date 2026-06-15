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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ fileType: 'cover' }),
    })
    const { uploadUrl } = await urlRes.json()
    await fetch(uploadUrl, {
      method: 'PUT',
      body: coverFile,
      headers: { 'Content-Type': coverFile.type },
    })
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ fileType: 'epub' }),
    })
    const { uploadUrl } = await urlRes.json()

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) setEpubProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error('Upload failed'))
      }
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
    if (res.ok) {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted)
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">ส่งรีวิวสำเร็จ!</h2>
        <p className="text-gray-600 mb-6">หนังสือของคุณอยู่ระหว่างการรีวิว ทีมงานจะตรวจสอบภายใน 1-3 วันทำการ</p>
        <button
          onClick={() => router.push('/publisher/books')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
        >
          กลับไปหน้าหนังสือ
        </button>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s
                  ? 'bg-indigo-600 text-white'
                  : step > s
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && <div className={`h-0.5 w-8 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {step === 1 && 'ข้อมูลหนังสือ'}
          {step === 2 && 'อัปโหลดปกหนังสือ'}
          {step === 3 && 'อัปโหลด EPUB'}
          {step === 4 && 'ส่งให้รีวิว'}
        </span>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">ข้อมูลหนังสือ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อหนังสือ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ชื่อหนังสือ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้แต่ง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ชื่อผู้แต่ง"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="คำอธิบายหนังสือ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาซื้อ (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price_buy}
                  onChange={e => setForm(f => ({ ...f, price_buy: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น 199"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ราคาเช่า (บาท) <span className="text-gray-400 text-xs">ไม่บังคับ</span>
                </label>
                <input
                  type="number"
                  value={form.price_rent}
                  onChange={e => setForm(f => ({ ...f, price_rent: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="เช่น 49"
                  min="0"
                />
              </div>
            </div>

            {priceBuy > 0 && (
              <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-indigo-900 mb-2">สัดส่วนรายได้ (ราคาซื้อ ฿{priceBuy})</p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white rounded p-2 text-center">
                    <p className="text-xs text-gray-500">สำนักพิมพ์ได้ 70%</p>
                    <p className="font-bold text-green-600">฿{publisherShare}</p>
                  </div>
                  <div className="flex-1 bg-white rounded p-2 text-center">
                    <p className="text-xs text-gray-500">Read24 ได้ 30%</p>
                    <p className="font-bold text-indigo-600">฿{platformShare}</p>
                  </div>
                </div>
              </div>
            )}

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingDraft ? 'กำลังบันทึก...' : 'บันทึกร่าง และไปขั้นตอนถัดไป'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-2">อัปโหลดปกหนังสือ</h2>
          <p className="text-sm text-gray-500 mb-4">ไฟล์ JPG หรือ PNG ขนาดแนะนำ 400x600px</p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={e => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload" className="cursor-pointer">
              <p className="text-3xl mb-2">🖼️</p>
              <p className="text-sm text-gray-500">
                {coverFile ? coverFile.name : 'คลิกเพื่อเลือกไฟล์'}
              </p>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              ข้ามขั้นตอนนี้
            </button>
            <button
              onClick={handleUploadCover}
              disabled={!coverFile || coverUploading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {coverUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดปก'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-2">อัปโหลดไฟล์ EPUB</h2>
          <p className="text-sm text-gray-500 mb-4">ไฟล์ .epub เท่านั้น</p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
            <input
              type="file"
              accept=".epub,application/epub+zip"
              onChange={e => setEpubFile(e.target.files?.[0] || null)}
              className="hidden"
              id="epub-upload"
            />
            <label htmlFor="epub-upload" className="cursor-pointer">
              <p className="text-3xl mb-2">📖</p>
              <p className="text-sm text-gray-500">
                {epubFile ? epubFile.name : 'คลิกเพื่อเลือกไฟล์ EPUB'}
              </p>
            </label>
          </div>
          {epubUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>กำลังอัปโหลด...</span>
                <span>{epubProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${epubProgress}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={handleUploadEpub}
            disabled={!epubFile || epubUploading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {epubUploading ? `กำลังอัปโหลด ${epubProgress}%` : 'อัปโหลด EPUB'}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-bold mb-2">ส่งให้รีวิว</h2>
          <p className="text-gray-500 text-sm mb-6">
            ตรวจสอบข้อมูลแล้ว คลิกเพื่อส่งหนังสือให้ทีมงาน Read24 รีวิว
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-1 text-sm">
            <p><span className="text-gray-500">ชื่อ:</span> <span className="font-medium">{form.title}</span></p>
            <p><span className="text-gray-500">ผู้แต่ง:</span> <span className="font-medium">{form.author}</span></p>
            <p><span className="text-gray-500">หมวดหมู่:</span> <span className="font-medium">{form.category}</span></p>
            <p><span className="text-gray-500">ราคา:</span> <span className="font-medium">฿{form.price_buy}</span></p>
            <p><span className="text-gray-500">ปก:</span> <span className={coverDone ? 'text-green-600' : 'text-gray-400'}>{coverDone ? 'อัปโหลดแล้ว' : 'ข้าม'}</span></p>
            <p><span className="text-gray-500">EPUB:</span> <span className={epubDone ? 'text-green-600' : 'text-red-500'}>{epubDone ? 'อัปโหลดแล้ว' : 'ยังไม่ได้อัปโหลด'}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={submitting || !epubDone}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งให้รีวิว'}
            </button>
          </div>
          {!epubDone && (
            <p className="text-red-500 text-xs mt-2">กรุณาอัปโหลด EPUB ก่อนส่งรีวิว</p>
          )}
        </div>
      )}
    </div>
  )
}
