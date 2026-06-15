import { MongoClient, ObjectId } from 'mongodb'
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:password@localhost:27017/read24?authSource=admin'
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost'
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000')
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin'
const BUCKET = process.env.MINIO_BUCKET || 'read24'

// Minimal valid EPUB structure
function createMinimalEpub(title: string, author: string): Buffer {
  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>body{font-family:'Noto Sans Thai',sans-serif;max-width:800px;margin:auto;padding:2rem;line-height:1.8;font-size:18px;}</style>
</head>
<body>
<h1>${title}</h1>
<p><em>โดย ${author}</em></p>
<hr/>
<h2>บทนำ</h2>
<p>นี่คือหนังสือตัวอย่างสำหรับการสาธิตระบบ Read24 — แพลตฟอร์มหนังสืออิเล็กทรอนิกส์ภาษาไทย</p>
<p>ระบบนี้รองรับการซื้อและเช่าหนังสือ โดยสามารถอ่านได้ผ่านเบราว์เซอร์โดยตรงโดยไม่ต้องดาวน์โหลดแอพเพิ่มเติม</p>
<h2>บทที่ 1</h2>
<p>เนื้อหาตัวอย่าง: ก ข ค ง จ ฉ ช ซ ญ ด ต ถ ท น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ส ห อ ฮ</p>
<p>การพัฒนาซอฟต์แวร์ในยุคปัจจุบันต้องการความรู้และทักษะหลากหลายด้าน ทั้งทางด้านการออกแบบ การเขียนโค้ด และการทดสอบระบบ</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
<h2>บทที่ 2</h2>
<p>เนื้อหาเพิ่มเติมสำหรับการสาธิต...</p>
<p>ภาษาไทยมีความสวยงามและเป็นเอกลักษณ์ของวัฒนธรรมไทย การส่งเสริมการอ่านหนังสือเป็นสิ่งสำคัญสำหรับการพัฒนาประเทศ</p>
</body>
</html>`

  return Buffer.from(htmlContent, 'utf-8')
}

const DEMO_BOOKS = [
  { title: 'ศิลปะการเป็นผู้นำ', author: 'ดร.สมชาย ใจดี', category: 'ธุรกิจ', price_buy: 199, price_rent: 49, description: 'หนังสือแนะแนวการพัฒนาภาวะผู้นำสำหรับยุคดิจิทัล ครอบคลุมทักษะการสื่อสาร การตัดสินใจ และการสร้างทีมงาน' },
  { title: 'ปรัชญาสโตอิก', author: 'มาร์คัส ออเรลิอัส (แปลโดย สมหมาย)', category: 'การศึกษา', price_buy: 149, price_rent: 39, description: 'ปรัชญาโบราณที่ช่วยให้รับมือกับความท้าทายในชีวิตประจำวัน' },
  { title: 'สวนผักในเมือง', author: 'นริศรา เขียวใส', category: 'สุขภาพ', price_buy: 129, price_rent: null, description: 'คู่มือปลูกผักอินทรีย์สำหรับคนเมือง พร้อมเทคนิคและวิธีการดูแล' },
  { title: 'ท่องโลกด้วยใจ', author: 'ปรีชา ท่องเที่ยว', category: 'ท่องเที่ยว', price_buy: 179, price_rent: 45, description: 'บันทึกการเดินทางรอบโลก 50 ประเทศ พร้อมเคล็ดลับการเดินทางแบบประหยัด' },
  { title: 'โค้ดดิ้งสำหรับทุกคน', author: 'ธนัท เทคโนโลยี', category: 'การศึกษา', price_buy: 259, price_rent: 65, description: 'เรียนรู้การเขียนโปรแกรมตั้งแต่พื้นฐาน ด้วยภาษา Python ที่เป็นมิตรกับผู้เริ่มต้น' },
  { title: 'นิทานอีสปฉบับสมบูรณ์', author: 'อีสป (แปลโดย วิมล)', category: 'นิยาย', price_buy: 99, price_rent: 29, description: 'รวมนิทานอีสปทั้งหมด พร้อมภาพประกอบสวยงาม เหมาะสำหรับทุกวัย' },
  { title: 'การลงทุนในตลาดหุ้น', author: 'ศุภชัย การเงิน', category: 'ธุรกิจ', price_buy: 299, price_rent: 79, description: 'คู่มือการลงทุนอย่างมีระบบ ตั้งแต่การวิเคราะห์ปัจจัยพื้นฐานไปจนถึงการวิเคราะห์กราฟ' },
  { title: 'สุขภาพดีด้วยโยคะ', author: 'อรทัย สุขใจ', category: 'สุขภาพ', price_buy: 159, price_rent: 39, description: 'คู่มือโยคะสำหรับมือใหม่ พร้อมท่าออกกำลังกาย 50 ท่า และเทคนิคการหายใจ' },
  { title: 'ประวัติศาสตร์กรุงเทพ', author: 'พิพิธภัณฑ์ไทย', category: 'การศึกษา', price_buy: 220, price_rent: 55, description: 'เรื่องราวของกรุงเทพมหานครตั้งแต่สมัยอยุธยาจนถึงปัจจุบัน พร้อมภาพหายาก' },
  { title: 'นิยายรัก ณ เมืองเก่า', author: 'สุดาวรรณ ดวงจิต', category: 'นิยาย', price_buy: 179, price_rent: 45, description: 'นิยายรักโรแมนติกกินใจ เรื่องราวของคู่รักที่พบกันในย่านเมืองเก่าเชียงใหม่' },
  { title: 'อาหารไทยสี่ภาค', author: 'มะลิวัลย์ ครัวไทย', category: 'สุขภาพ', price_buy: 189, price_rent: 49, description: 'ตำรับอาหารไทยแท้จากสี่ภาค พร้อมเคล็ดลับและประวัติความเป็นมาของแต่ละเมนู' },
  { title: 'เดินทางฝ่าแดนใต้', author: 'ยุทธนา ล่องใต้', category: 'ท่องเที่ยว', price_buy: 149, price_rent: null, description: 'สำรวจความงามและวัฒนธรรมอันหลากหลายของภาคใต้ไทย' },
  { title: 'จิตวิทยาความสุข', author: 'รศ.ดร.ประภาพร จิตดี', category: 'สุขภาพ', price_buy: 219, price_rent: 55, description: 'ศาสตร์แห่งความสุขจากงานวิจัยด้านจิตวิทยาเชิงบวก วิธีสร้างความสุขที่ยั่งยืน' },
  { title: 'ธุรกิจสตาร์ทอัพไทย', author: 'ไพบูลย์ สตาร์ทอัพ', category: 'ธุรกิจ', price_buy: 279, price_rent: 69, description: 'เรื่องราวความสำเร็จและบทเรียนจากสตาร์ทอัพไทย 20 บริษัท' },
  { title: 'กลอนไทยร่วมสมัย', author: 'คณะกวีไทย', category: 'นิยาย', price_buy: 129, price_rent: 35, description: 'รวมบทกวีร่วมสมัยจากกวีไทยรุ่นใหม่ สะท้อนสังคมและวัฒนธรรมไทยยุคปัจจุบัน' },
]

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()

  const s3 = new S3Client({
    endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
    region: 'us-east-1',
    credentials: { accessKeyId: MINIO_ACCESS_KEY, secretAccessKey: MINIO_SECRET_KEY },
    forcePathStyle: true,
  })

  // Ensure bucket exists
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }))
    console.log(`Bucket "${BUCKET}" already exists.`)
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET }))
    console.log(`Bucket "${BUCKET}" created.`)
  }

  // Upsert publisher (idempotent — matches existing seed.ts pattern)
  const publishers = db.collection('publishers')
  const publisherDoc = await publishers.findOneAndUpdate(
    { name: 'สำนักพิมพ์ดีดี' },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        name: 'สำนักพิมพ์ดีดี',
        revenue_share: 0.70,
        is_exclusive_default: false,
        contract_ref: 'DEMO-001',
        territory: 'TH',
        created_at: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  const publisherId = publisherDoc!._id

  const books = db.collection('books')
  let seeded = 0
  let skipped = 0

  for (const bookData of DEMO_BOOKS) {
    // Idempotent: skip if title already exists
    const existing = await books.findOne({ title: bookData.title })
    if (existing) {
      console.log(`  skip  ${bookData.title}`)
      skipped++
      continue
    }

    const bookId = new ObjectId()
    const epubKey = `books/${bookId.toString()}/book.epub`

    // Upload placeholder EPUB (HTML content served with epub mime type)
    const epubContent = createMinimalEpub(bookData.title, bookData.author)
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: epubKey,
        Body: epubContent,
        ContentType: 'application/epub+zip',
      }))
    } catch (err) {
      console.warn(`  warn  MinIO upload failed for "${bookData.title}" — continuing:`, err)
    }

    await books.insertOne({
      _id: bookId,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      category: bookData.category,
      cover_url: null,
      epub_key: epubKey,
      price_buy: bookData.price_buy,
      price_rent: bookData.price_rent ?? null,
      rent_days: bookData.price_rent ? 7 : null,
      publisher_id: publisherId,
      status: 'published',
      is_exclusive: false,
      created_at: new Date(),
      published_at: new Date(),
    })

    console.log(`  seeded  ${bookData.title}`)
    seeded++
  }

  console.log(`\nDone. seeded=${seeded} skipped=${skipped} total=${DEMO_BOOKS.length}`)
  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
