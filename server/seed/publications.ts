import { db } from "../db";
import { publications } from "@shared/schema";

const pubData = [
  {
    id: "38f6d634-7361-4725-b447-298042836a35",
    title:
      "Inform your Employer about Ramadhan & Invite them to Iftar\n通知你嘅僱主有關齋月及邀請佢哋一齊開齋",
    slug: "inform-employer-ramadhan-invite-iftar",
    excerpt:
      "Assalamualaikum, Ramadan Mubarak. Show this leaflet to your employer so they can understand why we fast during Ramadan and why we pray 5 times a day. Invite them to experience breaking fast at the mosque or any other location.",
    content:
      '<div style="text-align:center;"><img src="/images/ramadan-employer-iftar.jpeg" alt="Inform your Employer about Ramadhan and Invite them to Iftar" style="max-width:100%;height:auto;border-radius:12px;margin-bottom:24px;" /></div><h2>A Message to Share with Your Employer 與僱主分享的訊息</h2><p><strong>Assalamualaikum, Ramadan Mubarak.</strong></p><p>May our fasting, deeds and intentions be accepted this Ramadan, Ameen. Please show this leaflet to your employer if needed so they can understand why we fast during Ramadan and why we pray 5 times a day.</p><p>祝齋月蒙福。願我哋嘅齋戒、善行同意願都被接納，阿敏。如果有需要，可以將呢份單張俾你嘅僱主睇，幫助佢哋了解點解我哋喺齋月禁食，同埋點解我哋每日做五次禮拜。</p><p>If your employer would like to experience breaking fast in the mosque or any other location, please contact <strong>IMAH Addy Director +852 5249 4000</strong> or visit <strong>imah.org.hk</strong></p><p>如果你嘅僱主想體驗喺清真寺或者其他地方開齋，請聯絡 <strong>IMAH Addy 總監，電話 +852 5249 4000</strong>，網站 <strong>imah.org.hk</strong></p><hr /><h2>What is Ramadan? 齋月是什麼？</h2><p>During this month, Muslims strive to strengthen their willpower, purify their souls and minds. Through fasting from dawn to sunset, they abstain from food and desires to cleanse and restart their body and mind. They also perform many good deeds such as: honouring parents, being kind to neighbours, helping the poor, and making each day meaningful.</p><p>在這個月份，穆斯林努力鍛鍊自己的心志，淨化靈魂與思想，通過從黎明到日落期間的禁食與禁欲來潔淨並重啟身心，並透過許多善行，如：孝順父母、善待鄰居、接濟窮人等，充實每一天。</p><p>At the same time, Muslims train themselves to avoid bad deeds such as: backbiting, provocation, gossip, lying, etc.</p><p>同時鍛鍊自己遠離惡行，如：在背後詆毀他人、挑撥離間、撒謊等。</p><hr /><h2>Health Benefits of Fasting 禁食的整體益處</h2><p>Detoxification and cell repair, promoting fat burning and stabilising blood sugar levels, allowing the digestive system to rest, while also benefiting the heart, brain and mental health.</p><p>排毒和細胞修復，促進脂肪燃燒並穩定血糖水平，使消化系統休息，同時有益於心臟、大腦和心理健康。</p><hr /><h2>Prayer Timetable 禮拜時間表</h2><div style="text-align:center;"><img src="/images/ramadan-prayer-timetable.jpeg" alt="Prayer Timetable for Hong Kong" style="max-width:100%;height:auto;border-radius:12px;margin-bottom:24px;" /></div><p>The prayer timetable above is printed by the Islamic Union of Hong Kong, showing daily prayer times throughout the year including Fajr, Zuhar, Asar, Maghrib, and Isha prayers.</p><p>以上禮拜時間表由香港伊斯蘭聯會印製，列出全年每日嘅禮拜時間，包括晨禮、晌禮、晡禮、昏禮同宵禮。</p>',
    featuredImage: "/images/ramadan-employer-iftar.jpeg",
    author: "EMC HUB",
    status: "published" as const,
    tags: [
      "Ramadan",
      "Employer Guide",
      "Iftar",
      "Islamic Culture",
      "Hong Kong",
      "Prayer Timetable",
    ],
  },
  {
    id: "5780d585-3f99-48b9-b067-9a71e3947ea9",
    title: "Ramadhan Fasting Timetable\n齋月禁食時間表",
    slug: "ramadhan-fasting-timetable",
    excerpt:
      "Complete Ramadan fasting timetable for Hong Kong with daily Suhoor and Iftar times from 19 February to 20 March 2026.",
    content:
      '<div style="text-align:center;"><img src="/images/ramadan-timetable.jpeg" alt="Ramadan Fasting Timetable" style="max-width:100%;height:auto;border-radius:12px;margin-bottom:24px;" /></div><h2>Ramadan Fasting Schedule 齋月禁食時間表</h2><p>This timetable provides the daily Suhoor (pre-dawn meal) and Iftar (breaking fast) times for Ramadan in Hong Kong, from 19 February to 20 March 2026.</p><p>呢個時間表列出咗香港齋月期間每日嘅封齋（Suhoor）同開齋（Iftar）時間，由2026年2月19日至3月20日。</p><table><thead><tr><th>Ramadan</th><th>Date</th><th>Day</th><th>Suhoor</th><th>Iftar</th></tr></thead><tbody><tr><td>1</td><td>19-Feb</td><td>THU</td><td>5:37</td><td>6:25</td></tr><tr><td>2</td><td>20-Feb</td><td>FRI</td><td>5:36</td><td>6:26</td></tr><tr><td>3</td><td>21-Feb</td><td>SAT</td><td>5:35</td><td>6:26</td></tr><tr><td>4</td><td>22-Feb</td><td>SUN</td><td>5:35</td><td>6:27</td></tr><tr><td>5</td><td>23-Feb</td><td>MON</td><td>5:34</td><td>6:27</td></tr><tr><td>6</td><td>24-Feb</td><td>TUE</td><td>5:33</td><td>6:28</td></tr><tr><td>7</td><td>25-Feb</td><td>WED</td><td>5:33</td><td>6:28</td></tr><tr><td>8</td><td>26-Feb</td><td>THU</td><td>5:32</td><td>6:29</td></tr><tr><td>9</td><td>27-Feb</td><td>FRI</td><td>5:31</td><td>6:29</td></tr><tr><td>10</td><td>28-Feb</td><td>SAT</td><td>5:30</td><td>6:29</td></tr><tr><td>11</td><td>1-Mar</td><td>SUN</td><td>5:30</td><td>6:30</td></tr><tr><td>12</td><td>2-Mar</td><td>MON</td><td>5:29</td><td>6:30</td></tr><tr><td>13</td><td>3-Mar</td><td>TUE</td><td>5:28</td><td>6:31</td></tr><tr><td>14</td><td>4-Mar</td><td>WED</td><td>5:27</td><td>6:31</td></tr><tr><td>15</td><td>5-Mar</td><td>THU</td><td>5:26</td><td>6:32</td></tr><tr><td>16</td><td>6-Mar</td><td>FRI</td><td>5:26</td><td>6:32</td></tr><tr><td>17</td><td>7-Mar</td><td>SAT</td><td>5:25</td><td>6:32</td></tr><tr><td>18</td><td>8-Mar</td><td>SUN</td><td>5:24</td><td>6:33</td></tr><tr><td>19</td><td>9-Mar</td><td>MON</td><td>5:23</td><td>6:33</td></tr><tr><td>20</td><td>10-Mar</td><td>TUE</td><td>5:22</td><td>6:34</td></tr><tr><td>21</td><td>11-Mar</td><td>WED</td><td>5:22</td><td>6:34</td></tr><tr><td>22</td><td>12-Mar</td><td>THU</td><td>5:21</td><td>6:34</td></tr><tr><td>23</td><td>13-Mar</td><td>FRI</td><td>5:20</td><td>6:35</td></tr><tr><td>24</td><td>14-Mar</td><td>SAT</td><td>5:19</td><td>6:35</td></tr><tr><td>25</td><td>15-Mar</td><td>SUN</td><td>5:18</td><td>6:36</td></tr><tr><td>26</td><td>16-Mar</td><td>MON</td><td>5:17</td><td>6:36</td></tr><tr><td>27</td><td>17-Mar</td><td>TUE</td><td>5:16</td><td>6:36</td></tr><tr><td>28</td><td>18-Mar</td><td>WED</td><td>5:15</td><td>6:37</td></tr><tr><td>29</td><td>19-Mar</td><td>THU</td><td>5:14</td><td>6:37</td></tr><tr><td>30</td><td>20-Mar</td><td>FRI</td><td>5:13</td><td>6:37</td></tr></tbody></table><hr /><h2>Key Terms 重要用語</h2><ul><li><strong>Suhoor (封齋飯)</strong> – The pre-dawn meal eaten before fasting begins.</li><li><strong>Iftar (開齋飯)</strong> – The meal at sunset to break the fast.</li></ul><p>Times are based on Hong Kong local time. 以上時間以香港本地時間為準。</p>',
    featuredImage: "/images/ramadan-timetable.jpeg",
    author: "EMC HUB",
    status: "published" as const,
    tags: ["Ramadan", "Fasting Timetable", "Islamic Culture", "Hong Kong"],
  },
  {
    id: "b0664828-f6a2-444b-9a07-fd14f9d87760",
    title: "Get Ready for Ramadan\n迎接齋月：入門小指南",
    slug: "get-ready-for-ramadan",
    excerpt:
      "Ramadan is a special month in the Islamic calendar when Muslims around the world fast from dawn to sunset. Learn about its significance, daily routines, and how everyone can show support during this holy month.",
    content:
      '<h2>1. What is Ramadan? 乜嘢係齋月？</h2><p>Ramadan is a special month in the Islamic calendar when Muslims around the world fast from dawn to sunset. It is a time for spiritual reflection, self-discipline, and kindness to others.</p><p>齋月（Ramadan）係伊斯蘭曆入面一個好特別嘅月份，全球穆斯林會由天光到日落禁食。呢段時間重視靈性反思、自我約束，同埋對人更加有愛心。</p><p>Muslims believe that the Qur\'an, the holy book of Islam, was first revealed in this month. Because of that, Ramadan is considered the holiest month of the year for Muslims.</p><p>穆斯林相信，《古蘭經》（伊斯蘭嘅經典）係喺齋月開始降示，所以佢哋視齋月為一年之中最神聖嘅月份。</p><hr /><h2>2. What does fasting mean? 乜嘢係「齋戒／禁食」？</h2><p>During Ramadan, adult Muslims who are able to fast do not eat or drink anything from dawn until sunset. This includes water, snacks, and chewing gum.</p><p>喺齋月期間，有能力守齋嘅成年穆斯林，會由天光到日落都唔食嘢、唔飲嘢，包括水、零食同口香糖。</p><p>Fasting is not just about food. Muslims also try to control their tongue, emotions, and actions: avoiding gossip, bad language, and harmful behaviour. The goal is to become more patient, grateful, and conscious of God.</p><p>齋戒唔淨係關乎飲食，亦都包括管住自己嘅言語、情緒同行為：盡量避免講人是非、粗口，同埋傷害人嘅事。目的係學習忍耐、懂得感恩，亦更加記念真主（安拉）。</p><p>Some people do not fast, such as young children, travellers, pregnant or breastfeeding women, and those who are ill. In Islam, health and safety are very important, and there are special rules for these situations.</p><p>有啲人係唔需要守齋，例如細路、旅客、孕婦、哺乳期媽媽，或者身體有病嘅人。伊斯蘭好重視健康同安全，所以喺呢啲情況有特別安排。</p><hr /><h2>3. Daily routine in Ramadan 齋月入面一日點過？</h2><p>A typical day in Ramadan has two main meals around the fast:</p><p>齋月入面，一日大致有兩餐好重要嘅飯：</p><ul><li><strong>Suhoor (pre-dawn meal):</strong> A light but filling meal eaten before dawn to prepare for the day of fasting.<br/>封齋飯（Suhoor）：喺天光之前食嘅一餐，幫助頂住一日嘅禁食。</li><li><strong>Iftar (breaking-fast meal):</strong> The meal at sunset when Muslims end their fast, often with dates and water, followed by a proper dinner.<br/>開齋飯（Iftar）：日落之後開齋嘅一餐，通常先食椰棗同飲水，之後先正式食晚飯。</li></ul><p>Muslims also pray more during Ramadan. In addition to the five daily prayers, many attend extra night prayers called Tarawih at the mosque.</p><p>齋月期間，穆斯林會更加勤力祈禱。除咗每日五次嘅禮拜之外，仲會喺夜晚去清真寺做額外嘅禮拜，叫做「台拉威哈禮拜」（Tarawih）。</p><hr /><h2>4. Why is Ramadan important? 點解齋月咁重要？</h2><p>Ramadan helps Muslims to:</p><p>齋月對穆斯林嚟講，有幾方面好重要嘅意義：</p><ul><li><strong>Remember the poor</strong> – Feeling hunger reminds them of people who do not always have enough food.<br/>記念有需要嘅人：飢餓嘅感覺，令佢哋諗起平時冇足夠食物嘅人。</li><li><strong>Build self-control</strong> – Saying "no" to food and bad habits strengthens their character.<br/>培養自制力：學識對食物同壞習慣講「唔要」，可以鍛鍊品格。</li><li><strong>Grow closer to God</strong> – Through prayer, reading the Qur\'an, and doing good deeds.<br/>更加親近真主：透過祈禱、誦讀《古蘭經》同做好事，加深同真主嘅關係。</li><li><strong>Strengthen community</strong> – Families and friends break fast together, and mosques organise community meals.<br/>加強社群感：家人朋友一齊開齋，清真寺亦會舉辦社區開齋飯。</li></ul><hr /><h2>5. How do Muslims prepare? 點樣為齋月做準備？</h2><p>Many Muslims start getting ready weeks before Ramadan so they can make the most of this month.</p><p>好多穆斯林會喺齋月前幾個星期開始準備，希望好好把握呢個月份。</p><h3>1. Spiritual preparation 靈性準備</h3><ul><li>Praying more regularly and on time. 更加準時、認真咁做每日禮拜。</li><li>Reading a bit of the Qur\'an every day. 每日讀少少《古蘭經》。</li><li>Reflecting on their life and setting goals for the month. 反思自己嘅生活，為齋月定下一啲目標。</li></ul><h3>2. Physical preparation 身體準備</h3><ul><li>Sleeping earlier and adjusting to waking up for suhoor. 早啲瞓覺，慢慢習慣凌晨起身食封齋飯。</li><li>Eating more balanced meals and cutting down on overeating, caffeine, and very sugary drinks. 食得均衡啲，少啲暴食、咖啡因同過甜飲品。</li></ul><h3>3. Practical preparation 生活安排</h3><ul><li>Planning simple, healthy iftar and suhoor meals in advance. 預早諗定簡單又健康嘅開齋同封齋飯。</li><li>Organising work or study schedules so they have time to rest and worship. 安排好工作或者讀書時間，預留空間俾自己休息同敬拜。</li><li>Tidying the home and preparing a quiet corner for prayer. 執好屋企，預備一個清潔安靜嘅角落用嚟禮拜。</li></ul><hr /><h2>6. How can non-Muslims show support? 非穆斯林點樣表示體諒同支持？</h2><p>If you have Muslim friends, neighbours, or colleagues, Ramadan can be a good chance to show understanding and build friendship.</p><p>如果你身邊有穆斯林朋友、鄰居或者同事，齋月都係一個好機會去互相體諒，同加深友誼。</p><ul><li><strong>Be understanding about energy levels</strong> – Your Muslim friends might be more tired, especially in the afternoon. Try to avoid planning physically demanding activities at that time when possible.<br/>體諒對方體力：穆斯林朋友可能下午會比較攰，可以的話，盡量避免喺嗰段時間安排好吃力嘅活動。</li><li><strong>Do not eat or drink in front of fasting friends if you can help it</strong> – This is not a rule, but a kind gesture.<br/>盡量避免喺齋戒嘅朋友面前進食或飲水：呢個唔係規定，但係一種體貼嘅表現。</li><li><strong>Ask questions respectfully</strong> – Most Muslims are happy to explain what they are doing and why.<br/>用尊重嘅態度發問：大部分穆斯林都好樂意解釋佢哋嘅做法同原因。</li><li><strong>Join an iftar meal if invited</strong> – It is a great way to experience the culture and show solidarity.<br/>如果受邀參加開齋飯，歡迎出席：呢個係體驗文化同表達支持嘅好機會。</li></ul>',
    featuredImage: "/images/ramadan-guide.jpeg",
    author: "EMC HUB",
    status: "published" as const,
    tags: ["Ramadan", "Islamic Culture", "Hong Kong", "Community", "Guide"],
  },
];

export async function runSeedPublications(): Promise<void> {
  const existing = await db.select({ id: publications.id }).from(publications);
  if (existing.length > 0) {
    console.log(`✅ Publications already seeded (${existing.length} found)`);
    return;
  }
  console.log("🌱 Seeding publications data...");
  for (const pub of pubData) {
    await db.insert(publications).values(pub).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${pubData.length} publications successfully`);
}
