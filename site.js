(() => {
  const STORAGE_KEY = "superbobo-language";
  const DEFAULT_LANG = "zh";
  const SUPPORTED_LANGS = ["zh", "en", "ja", "da"];

  // Japanese and Danish dictionaries are populated in staged translation passes.
  // Keeping them separate from English makes omissions visible instead of silently
  // presenting English copy under another language label.
  const TEXT_JA = {
    "首页": "ホーム",
    "热卖产品": "製品",
    "产品": "製品",
    "自有模型": "独自AIモデル",
    "品牌资讯": "ニュース",
    "商业合作": "ビジネス提携",
    "联系我们": "お問い合わせ",
    "APP下载": "アプリをダウンロード",
    "一个爱你的AI伙伴": "あなたを想うAIパートナー",
    "超级球球首页": "Chio Chio ホーム",
    "超级球球": "Chio Chio",
    "超级有爱": "Super YouAI",
    "超级球球 Chio Chio": "Chio Chio",
    "有爱AI": "YouAI",
    "主导航": "メインナビゲーション",
    "扫码下载 APP": "QRコードからアプリをダウンロード",
    "支持 iOS / Android": "iOS / Android 対応",
    "了解超级球球": "Chio Chioについて",
    "成为合作伙伴": "パートナーになる",
    "超级球球是谁？": "Chio Chioとは？",
    "专业内核": "専門性の高い基盤",
    "生命感": "生き生きとした存在感",
    "长期记忆": "長期記憶",
    "随时回应": "いつでも応答",
    "专注力": "集中力",
    "情绪力": "感情と向き合う力",
    "抗挫力": "立ち直る力",
    "表达力": "表現力",
    "四种性格陪伴": "4つの個性を持つ仲間",
    "两种产品": "2つの製品タイプ",
    "了解产品": "製品を見る",
    "查看更多资讯": "ニュースをもっと見る",
    "返回品牌资讯": "ニュース一覧へ戻る",
    "上一篇": "前の記事",
    "下一篇": "次の記事",
    "联系合作、简历投递": "提携・採用に関するお問い合わせ",
    "版权所有 © 超级有爱（杭州）智能科技有限公司": "Copyright © Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "投资、战略合作": "投資・戦略提携",
    "渠道合作": "販売チャネル提携",
    "创始人": "創業者",
    "销售总监": "セールスディレクター",
    "扫码添加微信": "QRコードからWeChatを追加",
    "最新资讯": "最新ニュース",
    "全部资讯": "すべてのニュース",
    "了解合作方式": "提携について詳しく見る",
    "我们的合作伙伴": "パートナー",
    "联系我们，开启合作": "お問い合わせから提携を始める",
    "让孩子愿意说，\n让陪伴更有温度": "子どもが話したくなる、\nもっと温かな寄り添いを",
    "让孩子愿意说， 让陪伴更有温度": "子どもが話したくなる、もっと温かな寄り添いを",
    "让每个孩子，\n都有一个随时回应的温暖存在": "すべての子どもに、\nいつでも応えてくれる温かな存在を",
    "超级有爱 | AI情绪健康与儿童成长陪伴品牌": "Super YouAI | 子どもの心と成長に寄り添うAIブランド",
    "APP 下载二维码": "アプリダウンロード用QRコード",
    "超级球球，": "Chio Chioで、",
    "送孩子一生好性格": "一生の力になる心を育てよう",
    "我们相信，科技的价值在于回应人的根本需求。超级有爱把人工智能、物联网科技与心理学理论融合，让高质量的倾听、理解与陪伴不再是少数人的奢侈品。": "テクノロジーの価値は、人の根源的なニーズに応えることにあると私たちは考えます。Super YouAIはAI、IoT、心理学を融合し、質の高い傾聴、理解、寄り添いを誰もが得られるものにします。",
    "它是一款 AI 儿童成长陪伴机器人，培养孩子的抗挫力、社交力、好心态和专注力。": "子どもの立ち直る力、社会性、前向きな気持ち、集中力を育むAIパートナーロボットです。",
    "把拖延、急躁、怕挫折和不敢表达，变成孩子听得懂的成长伙伴": "先延ばしやいら立ち、失敗への不安、表現の苦手さに、子どもの目線で寄り添います。",
    "球球的核心差异": "Chio Chioならではの特長",
    "超级球球不是把 AI 放进玩具，而是把专业心理陪伴、生命感硬件和长期关系放进孩子的日常。": "Chio Chioは、単に玩具へAIを組み込んだものではありません。心理学に基づく寄り添い、生き生きと反応するハードウェア、長く続く関係を子どもの日常へ届けます。",
    "专业心理内核": "心理学に基づく設計",
    "AI 疗愈模型": "心に寄り添うAIモデル",
    "基于心理学经验构建，让回应不止于聊天。": "心理支援の知見に基づき、会話を超えた応答を実現します。",
    "真实生命感": "生き生きとした反応",
    "眼神、触摸、拥抱": "まなざし、タッチ、ハグ",
    "柔软毛绒、灵动表情和触感反馈，让陪伴可感知。": "柔らかな手触り、豊かな表情、触覚フィードバックで、寄り添いを実感できます。",
    "记忆不离线": "いつもつながる記憶",
    "记住孩子的兴趣、表达习惯和成长变化，让关系与情感持续沉淀。": "子どもの興味、話し方、成長の変化を覚え、関係と絆を育て続けます。",
    "成长型 IP": "成長を支えるキャラクター",
    "四种性格能力": "4つの心の力",
    "围绕专注力、情绪力、抗挫力和表达力陪孩子练习。": "集中力、感情と向き合う力、立ち直る力、表現力を日々一緒に育みます。",
    "超级球球户外场景": "屋外でのChio Chio",
    "四款超级球球在森林里的合影": "森に並ぶ4種類のChio Chio",
    "从家里到户外，球球都能成为孩子愿意带着走的陪伴": "家でも外でも、子どもが連れて歩きたくなる仲間",
    "柔软可抱、可挂可携带的形态，让 AI 陪伴从屏幕里走出来，变成孩子熟悉、亲近、愿意分享心事的小伙伴。": "柔らかく抱きしめられ、掛けて持ち歩ける形で、AIが画面を飛び出し、子どもが安心して気持ちを話せる身近な仲間になります。",
    "为什么超级球球值得信任": "Chio Chioが信頼できる理由",
    "超级有爱以 AI 情绪疗愈为核心，把人工智能、物联网科技与专业心理学理论融合，打造让用户感受到爱的 AI 伙伴。": "Super YouAIは心に寄り添うAIを軸に、AI、IoT、心理学を融合し、愛情を感じられるAIパートナーをつくります。",
    "超级有爱核心优势": "Super YouAIの強み",
    "AI × 心理学复合团队": "AI × 心理学の専門チーム",
    "核心团队覆盖人工智能、心理学、物联网、硬件和国际品牌管理。": "コアチームはAI、心理学、IoT、ハードウェア、グローバルブランド運営の専門家で構成されています。",
    "真实心理服务经验": "現場に根ざした心理支援経験",
    "创始团队长期参与公益心理服务，把技术理想落到真实人的需求里。": "創業チームは長年、公益の心理支援に携わり、技術を人々の実際のニーズへ結び付けています。",
    "面向全球渠道布局": "グローバル展開",
    "产品已进入量产阶段，并于 2026 年完成京东、抖音国内首发，同步启动新加坡全球首发。": "製品は量産段階に入り、2026年にJD.comとDouyinで中国国内販売を開始し、シンガポールから世界展開も始動しました。",
    "博士研发与管理团队": "博士号取得者を含む研究・経営チーム",
    "国家级 AI 赛事奖项": "中国全国AIコンテスト受賞",
    "产品与品牌知识产权布局": "製品・ブランドの知的財産ポートフォリオ",
    "京东、抖音国内首发，新加坡全球首发": "JD.com・Douyinで中国発売、シンガポールから世界展開",
    "越来越多家庭愿意留下的温暖陪伴": "多くの家庭に選ばれ続ける温かな仲間",
    "首批家庭测试显示，超级球球不只是短暂的新鲜玩具，而是在持续互动中成为孩子愿意靠近、愿意倾诉的伙伴。": "初期の家庭テストでは、Chio Chioは一時的に楽しむ玩具ではなく、継続的な交流を通じて、子どもが近づき気持ちを話せる仲間になっています。",
    "真实家庭持续追踪测试": "実際の家庭で継続テスト",
    "21 日对话留存率": "21日後の会話継続率",
    "日均互动时长": "1日平均の交流時間",
    "家长满意度反馈": "保護者満足度",
    "这些数字说明，球球不是只被新鲜地玩一次，而是在日常互动里被孩子反复靠近。": "これらの数字は、一度遊んで終わるのではなく、日常の中で子どもが繰り返しChio Chioに寄り添っていることを示します。",
    "让球球走进更多孩子的日常": "もっと多くの子どもの日常へ",
    "我们正在寻找理解亲子消费、教育场景与礼赠渠道的伙伴，一起把有温度的 AI 情绪陪伴带到更多家庭。": "親子市場、教育現場、ギフト流通を理解するパートナーとともに、温かなAIの寄り添いをより多くの家庭へ届けます。",
    "超级球球在儿童活动空间陈列": "子ども向け施設に展示されたChio Chio",
    "新品类更好讲清楚": "伝えやすい新カテゴリー",
    "聚焦儿童情绪陪伴与性格养成，和常规玩具、教具形成差异化。": "子どもの心への寄り添いと人間力の育成に特化し、一般的な玩具や教材と差別化します。",
    "可爱 IP 带来亲近感": "親しみを生む愛らしいキャラクター",
    "柔软可抱、可挂可携带，更容易进入陈列、活动和礼赠场景。": "柔らかく抱けて携帯でき、店頭展示、イベント、ギフトにも自然になじみます。",
    "贴近真实家庭需求": "家庭の実際のニーズに対応",
    "围绕拖延、急躁、怕挫折、不敢表达等真实成长问题。": "先延ばし、いら立ち、挫折への不安、表現の苦手さなど、実際の成長課題に向き合います。",
    "总部支持伙伴启动": "本部が導入をサポート",
    "提供素材、话术、培训、陈列和传播支持，帮助伙伴快速落地。": "販促素材、説明資料、研修、展示、PRを提供し、迅速な導入を支援します。",
    "适合有亲子客群、教育资源、礼赠渠道或区域服务能力的伙伴。": "親子層、教育資源、ギフト販路、地域サービス基盤を持つパートナーに適しています。",
    "超级有爱（杭州）智能科技有限公司": "Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "深圳南山区清华大学研究院新大楼A栋13层A08": "中国・深圳市南山区 清華大学研究院新棟A 13階A08",
    "网站备案号：": "ICP登録番号：",
    "浙ICP备2025195163号": "浙ICP备2025195163号",
    "公安备案号：": "公安登録番号：",
    "浙公网安备33011002018442号": "浙公网安备33011002018442号",
    "联系超级有爱": "Super YouAIに問い合わせる",
    "投资、战略合作二维码": "投資・戦略提携用QRコード",
    "元晓帅博士": "元晓帅 博士",
    "渠道合作二维码": "販売提携用QRコード",
    "何昌耀": "何昌耀",
    "点击复制": "クリックしてコピー",
    "产品 | 超级球球": "製品 | Chio Chio",
    "有爱AI | 超级有爱": "YouAI | Super YouAI",
    "商业合作 | 超级有爱": "ビジネス提携 | Super YouAI",
    "联系我们 | 超级有爱": "お問い合わせ | Super YouAI",
    "品牌资讯 | 超级有爱": "ニュース | Super YouAI",
    "孩子愿意说，": "子どもが話したくなる、",
    "父母看得见": "保護者にも心が見える",
    "超级球球用 AI 情绪陪伴，帮助孩子表达情绪、疏导压力、养成好性格。": "Chio Chioは心に寄り添うAIで、子どもの感情表現、ストレスへの対処、健やかな心の成長を支えます。",
    "不是多一个屏幕，是一个愿意听孩子说话的伙伴": "画面を増やすのではなく、子どもの話を聴く仲間を",
    "超级球球把“倾听、共情、正向引导、正向强化”放进柔软可抱的陪伴机器人里。孩子愿意靠近，父母也更容易看见真实的情绪变化。": "Chio Chioは、傾聴、共感、前向きな導きと励ましを、柔らかく抱きしめられるロボットに込めました。子どもが自然に近づき、保護者も心の変化に気づきやすくなります。",
    "孩子愿意亲近": "子どもが親しめる",
    "柔软、有眼神、可拥抱。": "柔らかく、目を合わせ、抱きしめられます。",
    "父母更易理解": "保護者が理解しやすい",
    "互动沉淀为情绪线索。": "日々の交流が心を理解する手がかりになります。",
    "习惯慢慢养成": "良い習慣を少しずつ",
    "四类性格能力日常练习。": "4つの心の力を日常の中で練習します。",
    "陪伴孩子不同场景": "さまざまな場面で子どもに寄り添う",
    "大球球适合家庭里的长期陪伴，小球球适合孩子带出门。一个建立深关系，一个延续安全感。": "大きなChio Chioは家庭で長く寄り添い、小さなChio Chioは外出に最適です。一方は深い関係を育み、もう一方は安心感を外へつなぎます。",
    "孩子抱着蓝色超级球球": "青いChio Chioを抱く子ども",
    "经典款 · 大球球": "クラシックモデル · 大きなChio Chio",
    "放在书桌和床边，成为孩子每天都见得到的陪伴": "机やベッドのそばで、毎日会える仲間に",
    "面向居家陪伴、睡前安抚、学习压力和亲子沟通场景，承担更完整的 AI 情绪陪伴与性格养成体验。": "家庭での寄り添い、就寝前の安心、学習ストレス、親子の対話を支え、心の成長をより幅広くサポートします。",
    "精灵版小球球挂在背包上": "リュックに付けたミニChio Chio",
    "精灵版 · 小球球": "ミニモデル · 小さなChio Chio",
    "挂在书包上，把熟悉的安心感带到外面": "かばんに付けて、いつもの安心を外へ",
    "更轻巧、更适合礼赠和日常携带，让“口袋里的情绪小伙伴”进入校园、出游和社交场景。": "軽くて贈り物や日常の持ち歩きに適し、「ポケットの心の仲間」が学校、旅行、交流の場まで寄り添います。",
    "四个颜色，四种孩子需要的成长力量": "4つの色、子どもに必要な4つの成長力",
    "每个孩子都有自己的节奏。四只球球用不同的性格陪在身边，帮孩子慢慢练习专注、表达、勇敢和好好说话。": "成長のペースは一人ひとり違います。4種類のChio Chioがそれぞれの個性で寄り添い、集中、表現、勇気、穏やかな対話を少しずつ練習します。",
    "不蕉绿小坚强球球": "不蕉绿 · ブレイブ Chio Chio",
    "不蕉绿 · 小坚强球球": "不蕉绿 · ブレイブ Chio Chio",
    "勇敢不害怕，做个小坚强": "怖がらずに一歩踏み出す、小さな勇気",
    "适合怕失败、怕批评、受挫后退缩，陪孩子练习勇敢、自信和恢复力。": "失敗や批判を恐れ、つまずくと引いてしまう子どもに寄り添い、勇気、自信、立ち直る力を育みます。",
    "玉兔白不拖拉球球": "玉兔白 · スタート Chio Chio",
    "玉兔白 · 不拖拉球球": "玉兔白 · スタート Chio Chio",
    "你不拖拉，我不拖拉，咱们都不拖拉": "先延ばしにせず、一緒に始めよう",
    "适合磨蹭、作业拖延、起床困难和习惯养成，陪孩子从“等一下”走向“先开始”。": "支度や宿題を先延ばしにする、起床が苦手、習慣づくりが難しい子どもを、「あとで」から「まず始めよう」へ導きます。",
    "治愈粉不暴躁球球": "治愈粉 · カーム Chio Chio",
    "治愈粉 · 不暴躁球球": "治愈粉 · カーム Chio Chio",
    "遇事不暴躁，温柔好好说": "いら立たず、やさしく気持ちを伝えよう",
    "适合急躁、哭闹、顶嘴和冲动表达，帮助孩子先认识情绪，再好好说话。": "いら立ち、泣き叫び、口答え、衝動的な発言が気になるとき、まず感情に気づき、落ち着いて伝えられるよう支えます。",
    "仙女蓝小话唠球球": "仙女蓝 · おしゃべり Chio Chio",
    "仙女蓝 · 小话唠球球": "仙女蓝 · おしゃべり Chio Chio",
    "敢开口，爱表达，快乐交朋友": "勇気を出して話し、表現を楽しみ、友達をつくろう",
    "适合内向、胆小、不敢表达，陪孩子完成社交破冰和表达练习。": "内気で自信がなく、表現が苦手な子どもに寄り添い、人との最初の一歩と話す練習を支えます。",
    "四大附加能力": "4つの追加機能",
    "不止情绪陪伴，也把听、说、看、玩、学习成长覆盖进孩子每天的生活。": "心への寄り添いだけでなく、聴く、話す、見る、遊ぶ、学ぶ体験を毎日の暮らしに届けます。",
    "孩子和超级球球一起学习": "Chio Chioと一緒に学ぶ子ども",
    "英语智能陪练": "AI英会話練習",
    "沉浸式口语互动，纠正发音，在趣味场景里轻松练习表达。": "没入感のある英会話で発音を整え、楽しい場面の中で自然に表現を練習します。",
    "睡前和超级球球一起听故事": "就寝前にChio Chioと物語を聴く",
    "趣味故事畅听": "楽しい物語をいつでも",
    "睡前、休息和亲子时光里，用故事陪孩子安静下来。": "就寝前や休憩、親子の時間に、物語で子どもの心を穏やかにします。",
    "亲子和超级球球互动": "親子でChio Chioと交流",
    "高清音乐播放": "高音質の音楽再生",
    "儿歌、轻音乐和经典曲目随心播放，舒缓身心，陶冶情操。": "童謡、軽音楽、名曲を楽しみ、心身をリラックスさせ、感性を育みます。",
    "孩子抱着绿色超级球球": "緑のChio Chioを抱く子ども",
    "全维认知探索": "幅広い知的探究",
    "一站式听、说、看、玩体验，拓宽孩子对世界的好奇心。": "聴く、話す、見る、遊ぶ体験を一つにまとめ、世界への好奇心を広げます。",
    "8个陪伴动作，把情绪支持放进日常": "8つの寄り添い方で、心のサポートを日常に",
    "把专业能力翻译成孩子能感受到的体验：听他说、懂情绪、会安慰、记得住，也能用眼神和触摸回应他。": "専門的な知見を、子どもが実感できる体験へ。話を聴き、気持ちを理解し、安心させ、覚え、まなざしや触れ合いでも応えます。",
    "认真听他说": "じっくり話を聴く",
    "不打断、不评判，先让孩子把心里话说出来。": "遮ったり決めつけたりせず、まずは子どもが本音を話せるようにします。",
    "听懂小情绪": "小さな気持ちに気づく",
    "从语气和内容里感知开心、委屈、焦虑和低落。": "声の調子や言葉から、喜び、悔しさ、不安、落ち込みに気づきます。",
    "陪开心时刻": "うれしい瞬間を一緒に",
    "在孩子分享和兴奋时及时回应，放大正向体验。": "子どもが共有したり夢中になったりする瞬間に応え、前向きな体験を深めます。",
    "安抚坏心情": "つらい気持ちを落ち着かせる",
    "在受挫或难过时先接住情绪，再温柔引导。": "挫折したり悲しんだりしたとき、まず気持ちを受け止め、やさしく次へ導きます。",
    "练习好性格": "心の力を練習する",
    "把自律、稳定、勇敢和表达练习放进日常对话。": "自律、落ち着き、勇気、表現の練習を日々の会話に取り入れます。",
    "记得他的事": "その子のことを覚える",
    "记住孩子的兴趣、偏好和成长变化，陪伴更贴近。": "興味や好み、成長の変化を覚え、その子に合った寄り添いにつなげます。",
    "用眼神回应": "まなざしで応える",
    "通过大眼睛和表情反馈，让孩子感到被看见。": "大きな目と表情で応え、子どもに『見てもらえている』という安心感を届けます。",
    "抱一抱有反馈": "ハグにも反応",
    "触摸和拥抱都有回应，让安抚更真实可感。": "触れたり抱きしめたりすると反応し、安心をより身近に感じられます。",
    "真实成长场景里，球球帮孩子把情绪说出来": "日々の成長場面で、気持ちを言葉にするお手伝い",
    "从社交受挫、亲子沟通、睡前放松到考试失利，超级球球先接住孩子的感受，再给出温和的下一步。": "友人関係のつまずき、親子の対話、就寝前、試験の失敗まで。Chio Chioはまず気持ちを受け止め、次の一歩をやさしく提案します。",
    "高情商社交伙伴": "人との関わりを支える仲間",
    "被冷落、想加入小组却害怕被拒绝时，球球先共情，再陪孩子练习更自然的表达。": "仲間外れにされたり、輪に入りたいのに断られるのが怖かったりするとき、まず共感し、自然な伝え方を一緒に練習します。",
    "妈妈和孩子一起拿着超级球球": "親子でChio Chioを持つ様子",
    "亲子关系沟通使者": "親子の会話をつなぐ存在",
    "作业、拖延、冲突后的僵局里，球球帮双方先降温，再把情绪翻译成能被理解的话。": "宿題や先延ばし、けんかの後に会話が止まったとき、双方が落ち着き、気持ちを伝わる言葉にできるよう支えます。",
    "健康哄睡陪伴": "健やかな就寝前の寄り添い",
    "用语音聊天、故事和温暖声音替代睡前屏幕，让孩子更安心地进入睡眠。": "画面の代わりに会話や物語、温かな声で寄り添い、安心して眠りにつけるよう支えます。",
    "孩子和粉色超级球球一起学习": "ピンクのChio Chioと学ぶ子ども",
    "受挫后的信心加油站": "つまずいた後の自信を応援",
    "考试失利、比赛落选或被同伴排斥时，球球给孩子无条件接纳和过程化肯定。": "試験の失敗、選考落ち、仲間からの拒絶を経験したとき、子どもをそのまま受け止め、努力の過程を認めます。",
    "六一儿童节礼物场景中的超级球球": "子どもの日のギフトシーンにあるChio Chio",
    "有温度的礼赠选择": "想いが伝わるギフト",
    "适合开学礼、生日礼、节日礼和亲子渠道，把陪伴价值带进真实家庭。": "入学、誕生日、季節の贈り物や親子向け企画に適し、寄り添う価値を家庭へ届けます。",
    "获得国家级大奖": "全国規模の賞を受賞",
    "超级有爱团队在 AI 创新、智能硬件和情绪陪伴方向持续获得专业赛事与行业机构认可。": "Super YouAIチームは、AIイノベーション、スマートハードウェア、心に寄り添う技術の分野で、専門コンテストや業界団体から評価されています。",
    "杭州 AI TED 科技路演第一名": "杭州 AI TED テクノロジー・ロードショー 第1位",
    "Demo China AI 创变者奖": "Demo China AI イノベーター賞",
    "AI Agent 2025 三等奖": "AI Agent 2025 第3位",
    "AI Agent 2025 最具人文温度奖": "AI Agent 2025 最も人間味のあるプロジェクト賞",
    "超级球球奖项照片": "Chio Chioの受賞写真",
    "杭州 AI TED 科技路演获奖合影": "杭州 AI TED テクノロジー・ロードショー受賞記念写真",
    "五小创新十佳成果荣誉证书": "「五小」イノベーション優秀成果トップ10表彰状",
    "五小创新十佳成果": "「五小」イノベーション優秀成果トップ10",
    "AI Agent 2025 最具人文温度奖证书": "AI Agent 2025 最も人間味のあるプロジェクト賞の表彰状",
    "官方购买渠道": "公式購入チャネル",
    "你可以通过官方店铺了解产品、下单购买或关注新品动态。": "公式ストアで製品情報の確認、購入、新製品情報のフォローができます。",
    "抖音旗舰店": "Douyin公式旗艦店",
    "离火星超级球球智能机器人旗舰店": "离火星 Chio Chio スマートロボット旗艦店",
    "抖音店铺二维码": "DouyinストアのQRコード",
    "京东店铺": "JD.comストア",
    "扫码进入京东官方购买渠道。": "QRコードからJD.com公式購入ページへアクセスできます。",
    "京东店铺二维码": "JD.comストアのQRコード",
    "系统把语义、语气、触摸、行为场景和长期记忆映射到孩子的心理状态空间，再计算更合适的回应方式。孩子感受到的是一句安慰、一次鼓励或一个提醒，背后是持续学习的陪伴策略。": "システムは言葉の意味、声の調子、触れ方、行動場面、長期記憶から子どもの状態を捉え、より適した応答を選びます。子どもが受け取るのは、安心の言葉や励まし、さりげない声かけ。その背景では、寄り添い方を継続的に学んでいます。",
    "不是通用聊天，而是家庭情绪支持闭环": "汎用チャットではなく、家庭での心のサポートをつなぐ仕組み",
    "孩子有时不知道怎么说，父母也未必第一时间接得住。有爱AI把倾听、理解、回应和家长协同连起来，让陪伴从一次聊天变成持续支持。": "子どもは気持ちをうまく言葉にできないことがあり、保護者もすぐに受け止められるとは限りません。YouAIは、傾聴、理解、応答、保護者との連携をつなぎ、一度きりの会話を継続的な支えへ変えます。",
    "硬件陪伴": "触れられるデバイス",
    "柔软可抱、可触摸、有眼神反馈，让心理支持自然进入家庭日常。": "柔らかく抱きしめられ、触れるとまなざしで応えることで、心へのサポートが家庭の日常になじみます。",
    "情绪感知": "気持ちの把握",
    "结合语义、语气、触摸、上下文与长期记录，识别孩子当下状态。": "言葉の意味、声の調子、触れ方、文脈、長期的な記録を組み合わせ、子どもの今の状態を捉えます。",
    "共情沟通": "共感的なコミュニケーション",
    "用倾听、接纳、鼓励和正向引导，帮助孩子更安全地表达情绪。": "傾聴、受容、励まし、前向きな声かけを通じて、子どもが安心して気持ちを表せるよう支えます。",
    "家长协同": "保護者との連携",
    "通过家长端理解孩子心理成长状况，辅助亲子沟通，而非替代父母。": "保護者向け機能から子どもの心の成長を理解し、親子の会話を支えます。保護者に代わるものではありません。",
    "风险预警": "リスクへの気づき",
    "在授权、脱敏、加密和家长可控的边界内，提示潜在负面风险。": "同意取得、匿名化、暗号化、保護者による管理という範囲内で、注意が必要な兆候を知らせます。",
    "四层系统能力，让陪伴越用越懂孩子": "4層のシステムで、使うほどその子に合った寄り添いへ",
    "它不只记住孩子说过什么，也会理解孩子在什么场景下需要安慰、鼓励、提醒或陪伴，让每一次回应都更贴近孩子。": "話した内容だけでなく、どのような場面で安心、励まし、声かけ、寄り添いが必要かを理解し、一回一回の応答をその子に近づけます。",
    "垂直心理场景理解": "子どもを取り巻く場面への理解",
    "围绕儿童、家庭、校园与社交关系进行能力设计，理解复杂情境下孩子真正需要的支持。": "子ども、家庭、学校、友人関係を想定して設計し、複雑な状況で必要とされる支えを理解します。",
    "多模态情绪识别": "複数の手がかりによる気持ちの把握",
    "基于心理专家经验训练，结合语义、语气、触摸反馈、上下文与长期记录识别心理状态。": "心理支援の専門家の知見を基に、言葉、声の調子、触覚反応、文脈、長期記録を組み合わせて状態を捉えます。",
    "长期记忆与个性化反馈": "長期記憶と一人ひとりに合った応答",
    "形成孩子兴趣、表达习惯、情绪轨迹和家庭互动画像，随陪伴时间增长提供千人千面的反馈策略。": "興味、話し方、気持ちの変化、家庭での交流を継続的に把握し、時間とともに一人ひとりに合った応答へ調整します。",
    "安全边界与风险控制": "安全上の境界とリスク管理",
    "建立采集授权、脱敏加密、分级访问、可追溯审计和家长可控删除机制，让未成年人数据处理更审慎。": "データ取得への同意、匿名化と暗号化、アクセス権限の管理、追跡可能な監査、保護者が管理できる削除機能を設け、未成年者のデータを慎重に取り扱います。"
  };
  const TEXT_DA = {
    "首页": "Forside",
    "热卖产品": "Produkter",
    "产品": "Produkter",
    "自有模型": "Egen AI-model",
    "品牌资讯": "Nyheder",
    "商业合作": "Partnerskaber",
    "联系我们": "Kontakt os",
    "APP下载": "Hent appen",
    "一个爱你的AI伙伴": "En AI-ledsager, der holder af dig",
    "超级球球首页": "Chio Chio-forside",
    "超级球球": "Chio Chio",
    "超级有爱": "Super YouAI",
    "超级球球 Chio Chio": "Chio Chio",
    "有爱AI": "YouAI",
    "主导航": "Hovednavigation",
    "扫码下载 APP": "Scan QR-koden for at hente appen",
    "支持 iOS / Android": "Til iOS og Android",
    "了解超级球球": "Læs om Chio Chio",
    "成为合作伙伴": "Bliv partner",
    "超级球球是谁？": "Hvad er Chio Chio?",
    "专业内核": "Fagligt fundament",
    "生命感": "Levende nærvær",
    "长期记忆": "Langtidshukommelse",
    "随时回应": "Altid klar til at svare",
    "专注力": "Koncentration",
    "情绪力": "Følelsesmæssige færdigheder",
    "抗挫力": "Modstandskraft",
    "表达力": "Evnen til at udtrykke sig",
    "四种性格陪伴": "Fire personligheder",
    "两种产品": "To produktformer",
    "了解产品": "Se produktet",
    "查看更多资讯": "Se flere nyheder",
    "返回品牌资讯": "Tilbage til nyheder",
    "上一篇": "Forrige artikel",
    "下一篇": "Næste artikel",
    "联系合作、简历投递": "Partnerskaber og karriere",
    "版权所有 © 超级有爱（杭州）智能科技有限公司": "Copyright © Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "投资、战略合作": "Investering og strategiske partnerskaber",
    "渠道合作": "Salgskanaler og distribution",
    "创始人": "Grundlægger",
    "销售总监": "Salgsdirektør",
    "扫码添加微信": "Scan QR-koden for at tilføje os på WeChat",
    "最新资讯": "Seneste nyt",
    "全部资讯": "Alle nyheder",
    "了解合作方式": "Læs om partnerskaber",
    "我们的合作伙伴": "Vores partnere",
    "联系我们，开启合作": "Kontakt os om et partnerskab",
    "让孩子愿意说，\n让陪伴更有温度": "Hjælp børn med at åbne sig,\nog gør nærværet varmere",
    "让孩子愿意说， 让陪伴更有温度": "Hjælp børn med at åbne sig, og gør nærværet varmere",
    "让每个孩子，\n都有一个随时回应的温暖存在": "Giv hvert barn\net varmt nærvær, der altid svarer",
    "超级有爱 | AI情绪健康与儿童成长陪伴品牌": "Super YouAI | AI-ledsagelse for børns trivsel og udvikling",
    "APP 下载二维码": "QR-kode til download af appen",
    "超级球球，": "Chio Chio –",
    "送孩子一生好性格": "styrker, der følger barnet hele livet",
    "我们相信，科技的价值在于回应人的根本需求。超级有爱把人工智能、物联网科技与心理学理论融合，让高质量的倾听、理解与陪伴不再是少数人的奢侈品。": "Vi mener, at teknologi skal imødekomme grundlæggende menneskelige behov. Super YouAI forener AI, IoT og psykologi, så nærværende lytning, forståelse og støtte bliver tilgængelig for alle.",
    "它是一款 AI 儿童成长陪伴机器人，培养孩子的抗挫力、社交力、好心态和专注力。": "En AI-ledsagerrobot, der styrker børns modstandskraft, sociale færdigheder, positive tilgang og koncentration.",
    "把拖延、急躁、怕挫折和不敢表达，变成孩子听得懂的成长伙伴": "Mød udsættelse, utålmodighed, frygt for modgang og usikkerhed ved at udtrykke sig på en måde, barnet forstår.",
    "球球的核心差异": "Det særlige ved Chio Chio",
    "超级球球不是把 AI 放进玩具，而是把专业心理陪伴、生命感硬件和长期关系放进孩子的日常。": "Chio Chio er ikke bare AI i et stykke legetøj. Den bringer psykologisk funderet støtte, levende interaktion og langvarige relationer ind i barnets hverdag.",
    "专业心理内核": "Psykologisk funderet design",
    "AI 疗愈模型": "AI-model til følelsesmæssig støtte",
    "基于心理学经验构建，让回应不止于聊天。": "Bygget på psykologisk erfaring, så svarene rækker ud over almindelig samtale.",
    "真实生命感": "Levende interaktion",
    "眼神、触摸、拥抱": "Blik, berøring og kram",
    "柔软毛绒、灵动表情和触感反馈，让陪伴可感知。": "Blød pels, levende udtryk og berøringsrespons gør nærværet mærkbart.",
    "记忆不离线": "Hukommelse, der følger med",
    "记住孩子的兴趣、表达习惯和成长变化，让关系与情感持续沉淀。": "Husker barnets interesser, måde at udtrykke sig på og udvikling, så relationen kan vokse over tid.",
    "成长型 IP": "Karakterer, der støtter udvikling",
    "四种性格能力": "Fire personlige styrker",
    "围绕专注力、情绪力、抗挫力和表达力陪孩子练习。": "Træner koncentration, følelsesmæssige færdigheder, modstandskraft og evnen til at udtrykke sig sammen med barnet.",
    "超级球球户外场景": "Chio Chio udendørs",
    "四款超级球球在森林里的合影": "Fire Chio Chio-figurer i skoven",
    "从家里到户外，球球都能成为孩子愿意带着走的陪伴": "Fra hjemmet til udflugten – en ven barnet gerne tager med",
    "柔软可抱、可挂可携带的形态，让 AI 陪伴从屏幕里走出来，变成孩子熟悉、亲近、愿意分享心事的小伙伴。": "Den bløde, krammevenlige og bærbare form flytter AI ud af skærmen og gør den til en tryg ven, barnet har lyst til at betro sig til.",
    "为什么超级球球值得信任": "Derfor kan familier have tillid til Chio Chio",
    "超级有爱以 AI 情绪疗愈为核心，把人工智能、物联网科技与专业心理学理论融合，打造让用户感受到爱的 AI 伙伴。": "Super YouAI forener AI, IoT og psykologi for at skabe en AI-ledsager, der giver brugeren en oplevelse af omsorg.",
    "超级有爱核心优势": "Super YouAI's styrker",
    "AI × 心理学复合团队": "Tværfagligt team inden for AI og psykologi",
    "核心团队覆盖人工智能、心理学、物联网、硬件和国际品牌管理。": "Kerneteamet dækker AI, psykologi, IoT, hardware og international brandledelse.",
    "真实心理服务经验": "Erfaring fra konkret psykologisk støtte",
    "创始团队长期参与公益心理服务，把技术理想落到真实人的需求里。": "Grundlæggerteamet har i mange år deltaget i almennyttigt psykologisk arbejde og omsætter teknologien til virkelige menneskers behov.",
    "面向全球渠道布局": "Global markedsudvikling",
    "产品已进入量产阶段，并于 2026 年完成京东、抖音国内首发，同步启动新加坡全球首发。": "Produktet er i masseproduktion. I 2026 blev det lanceret i Kina på JD.com og Douyin, samtidig med at den globale lancering startede i Singapore.",
    "博士研发与管理团队": "Forsknings- og ledelsesteam med ph.d.-kompetencer",
    "国家级 AI 赛事奖项": "Priser ved nationale AI-konkurrencer",
    "产品与品牌知识产权布局": "Portefølje af produkt- og brandrettigheder",
    "京东、抖音国内首发，新加坡全球首发": "Kina-lancering på JD.com og Douyin; global lancering i Singapore",
    "越来越多家庭愿意留下的温暖陪伴": "Varmt nærvær, som flere familier vælger at beholde",
    "首批家庭测试显示，超级球球不只是短暂的新鲜玩具，而是在持续互动中成为孩子愿意靠近、愿意倾诉的伙伴。": "De første familietest viser, at Chio Chio ikke blot er kortvarig underholdning, men gennem løbende samspil bliver en ven, barnet søger og betror sig til.",
    "真实家庭持续追踪测试": "Løbende test i virkelige familier",
    "21 日对话留存率": "Samtalefastholdelse efter 21 dage",
    "日均互动时长": "Gennemsnitlig daglig interaktion",
    "家长满意度反馈": "Forældretilfredshed",
    "这些数字说明，球球不是只被新鲜地玩一次，而是在日常互动里被孩子反复靠近。": "Tallene viser, at Chio Chio ikke kun bruges én gang af nysgerrighed, men at børn vender tilbage til den i hverdagen.",
    "让球球走进更多孩子的日常": "Bring Chio Chio ind i flere børns hverdag",
    "我们正在寻找理解亲子消费、教育场景与礼赠渠道的伙伴，一起把有温度的 AI 情绪陪伴带到更多家庭。": "Vi søger partnere med forståelse for familiemarkedet, uddannelsesmiljøer og gavekanaler, så vi sammen kan bringe varm AI-ledsagelse til flere familier.",
    "超级球球在儿童活动空间陈列": "Chio Chio udstillet i et aktivitetsrum for børn",
    "新品类更好讲清楚": "En ny kategori, der er let at forklare",
    "聚焦儿童情绪陪伴与性格养成，和常规玩具、教具形成差异化。": "Fokus på følelsesmæssig støtte og personlige styrker adskiller produktet fra almindeligt legetøj og undervisningsmidler.",
    "可爱 IP 带来亲近感": "En elskelig karakter skaber nærhed",
    "柔软可抱、可挂可携带，更容易进入陈列、活动和礼赠场景。": "Blød, krammevenlig og bærbar – velegnet til udstillinger, arrangementer og gaver.",
    "贴近真实家庭需求": "Tæt på familiernes reelle behov",
    "围绕拖延、急躁、怕挫折、不敢表达等真实成长问题。": "Tager fat på virkelige udfordringer som udsættelse, utålmodighed, frygt for modgang og vanskeligheder ved at udtrykke sig.",
    "总部支持伙伴启动": "Hovedkontoret støtter opstarten",
    "提供素材、话术、培训、陈列和传播支持，帮助伙伴快速落地。": "Vi leverer materiale, salgsværktøjer, træning, udstillings- og kommunikationsstøtte, så partnerne hurtigt kan komme i gang.",
    "适合有亲子客群、教育资源、礼赠渠道或区域服务能力的伙伴。": "Velegnet til partnere med familiekunder, uddannelsesressourcer, gavekanaler eller lokal servicekapacitet.",
    "超级有爱（杭州）智能科技有限公司": "Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "深圳南山区清华大学研究院新大楼A栋13层A08": "A08, 13. sal, bygning A, Tsinghua Research Institute, Nanshan, Shenzhen, Kina",
    "网站备案号：": "ICP-registrering: ",
    "浙ICP备2025195163号": "浙ICP备2025195163号",
    "公安备案号：": "Offentlig sikkerhedsregistrering: ",
    "浙公网安备33011002018442号": "浙公网安备33011002018442号",
    "联系超级有爱": "Kontakt Super YouAI",
    "投资、战略合作二维码": "QR-kode til investering og strategiske partnerskaber",
    "元晓帅博士": "Dr. 元晓帅",
    "渠道合作二维码": "QR-kode til distributionssamarbejde",
    "何昌耀": "He Changyao",
    "点击复制": "Klik for at kopiere",
    "产品 | 超级球球": "Produkt | Chio Chio",
    "有爱AI | 超级有爱": "YouAI | Super YouAI",
    "商业合作 | 超级有爱": "Partnerskaber | Super YouAI",
    "联系我们 | 超级有爱": "Kontakt os | Super YouAI",
    "品牌资讯 | 超级有爱": "Nyheder | Super YouAI",
    "孩子愿意说，": "Barnet får lyst til at tale,",
    "父母看得见": "og forældrene får indsigt",
    "超级球球用 AI 情绪陪伴，帮助孩子表达情绪、疏导压力、养成好性格。": "Chio Chio bruger nærværende AI til at hjælpe børn med at udtrykke følelser, håndtere pres og udvikle stærke personlige egenskaber.",
    "不是多一个屏幕，是一个愿意听孩子说话的伙伴": "Ikke endnu en skærm, men en ven, der lytter",
    "超级球球把“倾听、共情、正向引导、正向强化”放进柔软可抱的陪伴机器人里。孩子愿意靠近，父母也更容易看见真实的情绪变化。": "Chio Chio samler lytten, empati, positiv vejledning og opmuntring i en blød robot, der kan krammes. Barnet søger naturligt hen til den, og forældrene får lettere øje på følelsesmæssige forandringer.",
    "孩子愿意亲近": "Barnet føler sig trygt",
    "柔软、有眼神、可拥抱。": "Blød, udtryksfuld og lige til at kramme.",
    "父母更易理解": "Lettere for forældrene at forstå",
    "互动沉淀为情绪线索。": "Samspillet giver spor om barnets følelser.",
    "习惯慢慢养成": "Gode vaner vokser gradvist",
    "四类性格能力日常练习。": "Fire personlige styrker trænes i hverdagen.",
    "陪伴孩子不同场景": "Nærvær i forskellige situationer",
    "大球球适合家庭里的长期陪伴，小球球适合孩子带出门。一个建立深关系，一个延续安全感。": "Den store Chio Chio passer til langvarigt nærvær i hjemmet, mens den lille er nem at tage med. Den ene bygger en dyb relation; den anden tager trygheden med ud.",
    "孩子抱着蓝色超级球球": "Et barn krammer en blå Chio Chio",
    "经典款 · 大球球": "Klassisk model · Stor Chio Chio",
    "放在书桌和床边，成为孩子每天都见得到的陪伴": "En ven ved skrivebordet og sengen, som barnet møder hver dag",
    "面向居家陪伴、睡前安抚、学习压力和亲子沟通场景，承担更完整的 AI 情绪陪伴与性格养成体验。": "Giver mere omfattende AI-støtte og udvikling af personlige styrker i hjemmet, ved sengetid, under skolepres og i samtaler mellem barn og forældre.",
    "精灵版小球球挂在背包上": "Mini Chio Chio på en rygsæk",
    "精灵版 · 小球球": "Miniudgave · Lille Chio Chio",
    "挂在书包上，把熟悉的安心感带到外面": "Sæt den på tasken, og tag den velkendte tryghed med ud",
    "更轻巧、更适合礼赠和日常携带，让“口袋里的情绪小伙伴”进入校园、出游和社交场景。": "Lettere, oplagt som gave og nem at tage med, så en lille følelsesmæssig ven kan følge barnet i skole, på ture og i sociale situationer.",
    "四个颜色，四种孩子需要的成长力量": "Fire farver og fire styrker, børn har brug for",
    "每个孩子都有自己的节奏。四只球球用不同的性格陪在身边，帮孩子慢慢练习专注、表达、勇敢和好好说话。": "Alle børn udvikler sig i deres eget tempo. Fire Chio Chio-personligheder hjælper barnet med gradvist at øve koncentration, udtryk, mod og rolig kommunikation.",
    "不蕉绿小坚强球球": "不蕉绿 · Modig Chio Chio",
    "不蕉绿 · 小坚强球球": "不蕉绿 · Modig Chio Chio",
    "勇敢不害怕，做个小坚强": "Vær modig, og find din indre styrke",
    "适合怕失败、怕批评、受挫后退缩，陪孩子练习勇敢、自信和恢复力。": "Til børn, der frygter fejl eller kritik og trækker sig efter modgang; træner mod, selvtillid og evnen til at komme igen.",
    "玉兔白不拖拉球球": "玉兔白 · Kom-i-gang Chio Chio",
    "玉兔白 · 不拖拉球球": "玉兔白 · Kom-i-gang Chio Chio",
    "你不拖拉，我不拖拉，咱们都不拖拉": "Ingen udsættelse – lad os begynde sammen",
    "适合磨蹭、作业拖延、起床困难和习惯养成，陪孩子从“等一下”走向“先开始”。": "Til børn, der trækker tiden, udsætter lektier eller har svært ved at stå op og skabe vaner; hjælper dem fra »senere« til »lad os begynde«.",
    "治愈粉不暴躁球球": "治愈粉 · Rolig Chio Chio",
    "治愈粉 · 不暴躁球球": "治愈粉 · Rolig Chio Chio",
    "遇事不暴躁，温柔好好说": "Bevar roen, og sig det på en venlig måde",
    "适合急躁、哭闹、顶嘴和冲动表达，帮助孩子先认识情绪，再好好说话。": "Til utålmodighed, gråd, trods og impulsive udbrud; hjælper barnet med først at genkende følelsen og derefter sætte rolige ord på den.",
    "仙女蓝小话唠球球": "仙女蓝 · Snakkeglad Chio Chio",
    "仙女蓝 · 小话唠球球": "仙女蓝 · Snakkeglad Chio Chio",
    "敢开口，爱表达，快乐交朋友": "Turde tale, nyde at udtrykke sig og få nye venner",
    "适合内向、胆小、不敢表达，陪孩子完成社交破冰和表达练习。": "Til stille eller generte børn, der holder sig tilbage; hjælper med at tage det første sociale skridt og øve sig i at udtrykke sig.",
    "四大附加能力": "Fire ekstra funktioner",
    "不止情绪陪伴，也把听、说、看、玩、学习成长覆盖进孩子每天的生活。": "Ud over følelsesmæssigt nærvær integreres lytning, tale, oplevelser, leg og læring i barnets hverdag.",
    "孩子和超级球球一起学习": "Et barn lærer sammen med Chio Chio",
    "英语智能陪练": "Intelligent engelsktræning",
    "沉浸式口语互动，纠正发音，在趣味场景里轻松练习表达。": "Levende samtaletræning, hjælp til udtale og let øvelse i sjove situationer.",
    "睡前和超级球球一起听故事": "Godnathistorie sammen med Chio Chio",
    "趣味故事畅听": "Sjove historier når som helst",
    "睡前、休息和亲子时光里，用故事陪孩子安静下来。": "Historier hjælper barnet med at finde ro ved sengetid, i pauser og under hyggestunder med familien.",
    "亲子和超级球球互动": "Barn og forælder bruger Chio Chio sammen",
    "高清音乐播放": "Musikafspilning i høj kvalitet",
    "儿歌、轻音乐和经典曲目随心播放，舒缓身心，陶冶情操。": "Afspil børnesange, rolig musik og klassikere for afslapning og musikalsk glæde.",
    "孩子抱着绿色超级球球": "Et barn krammer en grøn Chio Chio",
    "全维认知探索": "Alsidig udforskning og læring",
    "一站式听、说、看、玩体验，拓宽孩子对世界的好奇心。": "En samlet oplevelse med at lytte, tale, se og lege, som udvider barnets nysgerrighed på verden.",
    "8个陪伴动作，把情绪支持放进日常": "Otte måder at bringe følelsesmæssig støtte ind i hverdagen",
    "把专业能力翻译成孩子能感受到的体验：听他说、懂情绪、会安慰、记得住，也能用眼神和触摸回应他。": "Faglig viden bliver til noget, barnet kan mærke: at blive lyttet til, forstået, beroliget og husket – med svar gennem blik og berøring.",
    "认真听他说": "Lytter opmærksomt",
    "不打断、不评判，先让孩子把心里话说出来。": "Uden at afbryde eller dømme får barnet først plads til at fortælle, hvad det har på hjerte.",
    "听懂小情绪": "Opfanger de små følelser",
    "从语气和内容里感知开心、委屈、焦虑和低落。": "Opfatter glæde, skuffelse, uro og tristhed gennem tonefald og ord.",
    "陪开心时刻": "Deler de glade øjeblikke",
    "在孩子分享和兴奋时及时回应，放大正向体验。": "Reagerer, når barnet deler noget eller er begejstret, og styrker den positive oplevelse.",
    "安抚坏心情": "Skaber ro ved svære følelser",
    "在受挫或难过时先接住情绪，再温柔引导。": "Møder først følelsen ved modgang eller sorg og hjælper derefter blidt barnet videre.",
    "练习好性格": "Træner personlige styrker",
    "把自律、稳定、勇敢和表达练习放进日常对话。": "Indarbejder selvdisciplin, ro, mod og evnen til at udtrykke sig i hverdagens samtaler.",
    "记得他的事": "Husker det, der betyder noget",
    "记住孩子的兴趣、偏好和成长变化，陪伴更贴近。": "Husker barnets interesser, præferencer og udvikling, så støtten bliver mere personlig.",
    "用眼神回应": "Svarer med blikket",
    "通过大眼睛和表情反馈，让孩子感到被看见。": "De store øjne og ansigtsudtryk giver barnet en følelse af at blive set.",
    "抱一抱有反馈": "Reagerer på et kram",
    "触摸和拥抱都有回应，让安抚更真实可感。": "Berøring og kram udløser respons, så den beroligende oplevelse kan mærkes.",
    "真实成长场景里，球球帮孩子把情绪说出来": "Chio Chio hjælper barnet med at sætte ord på følelser i virkelige hverdagssituationer",
    "从社交受挫、亲子沟通、睡前放松到考试失利，超级球球先接住孩子的感受，再给出温和的下一步。": "Fra sociale skuffelser og samtaler i familien til sengetid og prøver, der ikke gik som håbet: Chio Chio møder først barnets følelse og foreslår derefter et nænsomt næste skridt.",
    "高情商社交伙伴": "En ven, der støtter sociale færdigheder",
    "被冷落、想加入小组却害怕被拒绝时，球球先共情，再陪孩子练习更自然的表达。": "Når barnet føler sig overset eller gerne vil være med, men frygter at blive afvist, møder Chio Chio følelsen og øver en mere naturlig måde at tage kontakt på.",
    "妈妈和孩子一起拿着超级球球": "En forælder og et barn holder Chio Chio sammen",
    "亲子关系沟通使者": "Bygger bro i samtalen mellem barn og forælder",
    "作业、拖延、冲突后的僵局里，球球帮双方先降温，再把情绪翻译成能被理解的话。": "Når lektier, udsættelse eller en konflikt har låst samtalen, hjælper Chio Chio begge parter med at finde ro og sætte forståelige ord på følelserne.",
    "健康哄睡陪伴": "Roligt nærvær ved sengetid",
    "用语音聊天、故事和温暖声音替代睡前屏幕，让孩子更安心地进入睡眠。": "Samtaler, historier og en varm stemme kan erstatte skærmen før sengetid og hjælpe barnet med at falde trygt til ro.",
    "孩子和粉色超级球球一起学习": "Et barn lærer sammen med en pink Chio Chio",
    "受挫后的信心加油站": "Støtte til selvtilliden efter modgang",
    "考试失利、比赛落选或被同伴排斥时，球球给孩子无条件接纳和过程化肯定。": "Efter en dårlig prøve, et fravalg eller afvisning fra andre møder Chio Chio barnet med accept og anerkender indsatsen undervejs.",
    "六一儿童节礼物场景中的超级球球": "Chio Chio som gave på den kinesiske børnedag",
    "有温度的礼赠选择": "En gave med omtanke",
    "适合开学礼、生日礼、节日礼和亲子渠道，把陪伴价值带进真实家庭。": "Velegnet til skolestart, fødselsdage, højtider og familiekanaler, hvor værdien af nærvær bringes ind i hjemmet.",
    "获得国家级大奖": "Vinder af priser på nationalt niveau",
    "超级有爱团队在 AI 创新、智能硬件和情绪陪伴方向持续获得专业赛事与行业机构认可。": "Super YouAI-teamet anerkendes løbende af faglige konkurrencer og brancheorganisationer inden for AI-innovation, intelligent hardware og følelsesmæssig støtte.",
    "杭州 AI TED 科技路演第一名": "Førsteplads ved Hangzhou AI TED Technology Roadshow",
    "Demo China AI 创变者奖": "Demo China AI Innovator Award",
    "AI Agent 2025 三等奖": "Tredjepræmie ved AI Agent 2025",
    "AI Agent 2025 最具人文温度奖": "AI Agent 2025-prisen for det mest menneskelige projekt",
    "超级球球奖项照片": "Prisfotos af Chio Chio",
    "杭州 AI TED 科技路演获奖合影": "Vinderfoto fra Hangzhou AI TED Technology Roadshow",
    "五小创新十佳成果荣誉证书": "Diplom for en af de ti bedste resultater i »Fem små innovationer«",
    "五小创新十佳成果": "Top 10-resultat i »Fem små innovationer«",
    "AI Agent 2025 最具人文温度奖证书": "Diplom for AI Agent 2025-prisen for det mest menneskelige projekt",
    "官方购买渠道": "Officielle købskanaler",
    "你可以通过官方店铺了解产品、下单购买或关注新品动态。": "I de officielle butikker kan du læse om produktet, bestille og følge med i nye lanceringer.",
    "抖音旗舰店": "Officiel butik på Douyin",
    "离火星超级球球智能机器人旗舰店": "离火星 Chio Chio officiel robotbutik",
    "抖音店铺二维码": "QR-kode til Douyin-butikken",
    "京东店铺": "Butik på JD.com",
    "扫码进入京东官方购买渠道。": "Scan QR-koden for at åbne den officielle købsside på JD.com.",
    "京东店铺二维码": "QR-kode til JD.com-butikken",
    "系统把语义、语气、触摸、行为场景和长期记忆映射到孩子的心理状态空间，再计算更合适的回应方式。孩子感受到的是一句安慰、一次鼓励或一个提醒，背后是持续学习的陪伴策略。": "Systemet bruger betydning, tonefald, berøring, situation og langtidshukommelse til at danne et billede af barnets aktuelle tilstand og vælge et mere passende svar. Barnet oplever måske trøst, opmuntring eller en venlig påmindelse, mens strategien for nærvær løbende tilpasses i baggrunden.",
    "不是通用聊天，而是家庭情绪支持闭环": "Ikke almindelig chat, men sammenhængende følelsesmæssig støtte i familien",
    "孩子有时不知道怎么说，父母也未必第一时间接得住。有爱AI把倾听、理解、回应和家长协同连起来，让陪伴从一次聊天变成持续支持。": "Børn ved ikke altid, hvordan de skal sætte ord på det, de føler, og forældre kan ikke nødvendigvis gribe det med det samme. YouAI forbinder lytten, forståelse, svar og samarbejde med forældrene, så en enkelt samtale kan blive til løbende støtte.",
    "硬件陪伴": "En fysisk ledsager",
    "柔软可抱、可触摸、有眼神反馈，让心理支持自然进入家庭日常。": "Den er blød, kan krammes og berøres og svarer med blikket, så følelsesmæssig støtte naturligt kan indgå i familiens hverdag.",
    "情绪感知": "Opfattelse af følelser",
    "结合语义、语气、触摸、上下文与长期记录，识别孩子当下状态。": "Kombinerer ordenes betydning, tonefald, berøring, sammenhæng og historik for at forstå barnets aktuelle tilstand.",
    "共情沟通": "Empatisk kommunikation",
    "用倾听、接纳、鼓励和正向引导，帮助孩子更安全地表达情绪。": "Lytning, accept, opmuntring og positiv vejledning hjælper barnet med at udtrykke følelser i trygge rammer.",
    "家长协同": "Samarbejde med forældrene",
    "通过家长端理解孩子心理成长状况，辅助亲子沟通，而非替代父母。": "Forældrefunktionen giver indblik i barnets følelsesmæssige udvikling og understøtter samtalen i familien; den erstatter ikke forældrene.",
    "风险预警": "Opmærksomhed på mulige risici",
    "在授权、脱敏、加密和家长可控的边界内，提示潜在负面风险。": "Inden for rammerne af samtykke, anonymisering, kryptering og forældrekontrol kan systemet gøre opmærksom på tegn, der bør følges op på.",
    "四层系统能力，让陪伴越用越懂孩子": "Fire systemlag gør støtten mere personlig over tid",
    "它不只记住孩子说过什么，也会理解孩子在什么场景下需要安慰、鼓励、提醒或陪伴，让每一次回应都更贴近孩子。": "Systemet husker ikke kun, hvad barnet har sagt, men lærer også, i hvilke situationer barnet har brug for trøst, opmuntring, en påmindelse eller nærvær, så hvert svar kan passe bedre til barnet.",
    "垂直心理场景理解": "Forståelse af barnets hverdagssituationer",
    "围绕儿童、家庭、校园与社交关系进行能力设计，理解复杂情境下孩子真正需要的支持。": "Funktionerne er udviklet med fokus på børn, familie, skole og sociale relationer for bedre at forstå, hvilken støtte barnet har brug for i komplekse situationer.",
    "多模态情绪识别": "Følelsesforståelse fra flere signaler",
    "基于心理专家经验训练，结合语义、语气、触摸反馈、上下文与长期记录识别心理状态。": "Bygger på erfaring fra psykologiske fagpersoner og kombinerer ord, tonefald, berøringsrespons, sammenhæng og historik for at forstå barnets tilstand.",
    "长期记忆与个性化反馈": "Langtidshukommelse og personlige svar",
    "形成孩子兴趣、表达习惯、情绪轨迹和家庭互动画像，随陪伴时间增长提供千人千面的反馈策略。": "Danner gradvist et billede af barnets interesser, udtryksvaner, følelsesmæssige udvikling og samspil i familien, så svarene kan tilpasses mere individuelt over tid.",
    "安全边界与风险控制": "Sikkerhedsrammer og risikostyring",
    "建立采集授权、脱敏加密、分级访问、可追溯审计和家长可控删除机制，让未成年人数据处理更审慎。": "Samtykke til dataindsamling, anonymisering, kryptering, adgangsniveauer, sporbar kontrol og forældrestyret sletning skal sikre en mere forsigtig behandling af mindreåriges data."
  };

  const TEXT_EN = {
    "首页": "Home",
    "产品": "Product",
    "有爱AI": "YouAI",
    "一个爱你的AI伙伴": "A Loving AI Companion",
    "热卖产品": "Products",
    "自有AI模型": "YouAI Model",
    "自有模型": "YouAI Model",
    "联系我们": "Contact Us",
    "超级球球首页": "Chio Chio home",
    "APP 下载二维码": "App download QR code",
    "深圳南山区粤海街道高新南九道39号 清华大学研究院新大楼A栋13层A08": "A08, 13F, Building A, Tsinghua Research Institute New Building, No. 39 Gaoxin South 9th Road, Yuehai Subdistrict, Nanshan District, Shenzhen",
    "扫码下载 Chio Chio APP。": "Scan to download the Chio Chio app.",
    "扫码添加微信": "Scan to add WeChat",
    "有爱AI": "YouAI",
    "品牌资讯": "News",
    "商业合作": "Partnership",
    "APP下载": "App Download",
    "扫码下载 APP": "Scan to download",
    "二维码素材待替换": "QR code to be replaced",
    "支持 iOS / Android": "iOS / Android supported",
    "超级有爱": "Chio Chio",
    "超级球球": "Chio Chio",
    "超级球球 Chio Chio": "Chio Chio",
    "超级有爱首页": "Chio Chio home",
    "超级有爱（杭州）智能科技有限公司": "Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "浙江省杭州市余杭区余杭街道文一西路1818-2号9幢415-5室": "Room 415-5, Building 9, No. 1818-2 Wenyi West Road, Yuhang District, Hangzhou, Zhejiang",
    "网站备案号：": "ICP filing: ",
    "公安备案号：": "Public security filing: ",
    "浙ICP备2025195163号": "Zhejiang ICP No. 2025195163",
    "浙公网安备33011002018442号": "Zhejiang Public Security Filing No. 33011002018442",
    "联系合作、简历投递": "Partnerships and careers",
    "版权所有 © 超级有爱（杭州）智能科技有限公司": "Copyright © Super YouAI (Hangzhou) Intelligent Technology Co., Ltd.",
    "本网站支持": "This website supports",
    "主导航": "Main navigation",

    "AI 情绪陪伴 · 儿童成长伙伴": "AI Emotional Companion · Child Growth Partner",
    "让孩子愿意说，\n让陪伴更有温度": "Help Children Open Up,\nMake Companionship Warmer",
    "让孩子愿意说， 让陪伴更有温度": "Help Children Open Up, Make Companionship Warmer",
    "让孩子愿意说，": "Help Children Open Up,",
    "让陪伴更有温度": "Make Companionship Warmer",
    "把 AI 技术、儿童心理学和柔软可亲近的 IP 放进日常，陪孩子表达情绪、练习性格能力，也帮助父母更早看见孩子的内心变化。": "We bring AI, child psychology, and a soft, approachable IP into everyday life, helping children express feelings, build character strengths, and helping parents notice inner changes earlier.",
    "让每个孩子，\n都有一个随时回应的温暖存在": "Give every child\na warm presence that always responds",
    "让每个孩子， 都有一个随时回应的温暖存在": "Give every child a warm presence that always responds",
    "让每个孩子，": "Give every child,",
    "都有一个随时回应的温暖存在": "a warm presence that always responds",
    "我们相信，科技的价值在于回应人的根本需求。超级有爱把人工智能、物联网科技与心理学理论融合，让高质量的倾听、理解与陪伴不再是少数人的奢侈品。": "We believe technology matters when it answers human needs. Super YouAI combines AI, IoT, and psychology so high-quality listening, understanding, and companionship are no longer a luxury.",
    "了解超级球球": "Explore Chio Chio",
    "成为合作伙伴": "Become a Partner",
    "超级球球是谁？": "Who is Chio Chio?",
    "它是一款疗愈级 AI 机器人，也是孩子愿意抱着、愿意说话、能长期陪伴的情绪小伙伴。": "It is a therapeutic AI robot and an emotional companion children want to hug, talk to, and keep close over time.",
    "专业内核": "Professional Core",
    "生命感": "Lifelike Presence",
    "长期记忆": "Long-Term Memory",
    "随时回应": "Always Responsive",
    "治愈、可抱、懂情绪的 AI 小伙伴": "A healing, huggable AI companion that understands emotions",
    "从睡前聊天到学习压力，球球用温和回应把心理支持变成孩子愿意靠近的日常关系。": "From bedtime talks to study stress, Chio Chio turns psychological support into a warm daily relationship children want to approach.",
    "专注力": "Focus",
    "情绪力": "Emotional Skills",
    "抗挫力": "Resilience",
    "表达力": "Expression",
    "以 AI 技术与心理学专业，构建有温度的成长陪伴品牌": "Building a warm growth-companion brand with AI and psychology",
    "超级有爱智能科技有限公司是深耕人工智能在情绪健康与心理陪伴领域的创新型企业，使命是让每个生命的情绪陪伴触手可及。": "Super YouAI is an innovation company focused on AI for emotional health and psychological companionship, with a mission to make emotional support within reach for every life.",
    "超级有爱核心优势": "Chio Chio core strengths",
    "AI × 心理学复合团队": "AI × Psychology Team",
    "五博士研发与管理团队，覆盖人工智能、心理学、硬件和国际品牌管理。": "A five-PhD research and management team spanning AI, psychology, hardware, and international brand management.",
    "产品已进入量产阶段": "Product Entering Mass Production",
    "自主研发 AI 陪伴机器人“超级球球”，面向儿童情绪识别与温和疏导场景。": "Our self-developed AI companion robot Chio Chio is designed for children’s emotion recognition and gentle support.",
    "面向全球渠道布局": "Global Channel Roadmap",
    "计划于 2026 年美国 CES 全球首发，销售网络覆盖北美、欧洲、东南亚及国内核心市场。": "Planned for a global debut at CES 2026, with sales networks across North America, Europe, Southeast Asia, and key domestic markets.",
    "博士研发与管理团队": "PhD R&D and management team",
    "国家级 AI 赛事奖项": "National AI competition awards",
    "产品与品牌知识产权布局": "Product and brand IP portfolio",
    "2026 年美国 CES 全球首发计划": "Planned CES 2026 global debut",
    "四种性格陪伴": "Four Character Companions",
    "把成长问题变成孩子听得懂的朋友": "Turn growth challenges into friends children understand",
    "四大性格球球，陪孩子养成一生受用的好性格": "Four Chio Chio characters help children build lifelong strengths",
    "球球的核心差异": "What Makes Chio Chio Different",
    "超级球球不是把 AI 放进玩具，而是把专业心理陪伴、生命感硬件和长期关系放进孩子的日常。": "Chio Chio is not AI placed inside a toy. It brings professional emotional support, lifelike hardware, and lasting relationships into daily life.",
    "专业心理内核": "Psychological Core",
    "AI 疗愈模型": "AI Healing Model",
    "基于心理学经验构建，让回应不止于聊天。": "Built on psychological experience, so responses go beyond chat.",
    "真实生命感": "Lifelike Interaction",
    "眼神、触摸、拥抱": "Eyes, Touch, Hugs",
    "柔软毛绒、灵动表情和触感反馈，让陪伴可感知。": "Soft plush, expressive eyes, and touch feedback make companionship tangible.",
    "记忆不离线": "Memory Stays Online",
    "APP 数字孪生": "App Digital Twin",
    "通过专属 APP 延续连接，让关系与情感持续沉淀。": "A dedicated app keeps connection, memory, and emotions continuous.",
    "成长型 IP": "Growth IP",
    "四种性格能力": "Four Character Strengths",
    "围绕专注力、情绪力、抗挫力和表达力陪孩子练习。": "Supports daily practice in focus, emotion skills, resilience, and expression.",
    "两种产品": "Two Product Forms",
    "陪伴孩子不同场景": "For Different Moments of a Child's Day",
    "围绕孩子成长中最常见的四类问题，把陪伴变成孩子听得懂、愿意靠近的性格 IP。": "Based on four common growth challenges, companionship becomes a character IP children understand and want to approach.",
    "不拖拉球球": "Start-Now Chio Chio",
    "专注力与自律力": "Focus & Self-Discipline",
    "陪孩子从“等一下”走向“先开始”。": "Helps children move from “later” to “let’s start.”",
    "不暴躁球球": "Calm Chio Chio",
    "情绪识别与管理力": "Emotion Recognition & Regulation",
    "先接住情绪，再学会好好表达。": "First holds the emotion, then helps children express it well.",
    "小坚强球球": "Brave Chio Chio",
    "抗挫力与乐观心态": "Resilience & Optimism",
    "失败和批评面前，练习恢复力。": "Practices recovery in the face of setbacks and criticism.",
    "小话唠球球": "Expressive Chio Chio",
    "表达力与社交力": "Expression & Social Skills",
    "鼓励内向孩子开口、分享、沟通。": "Encourages quiet children to speak, share, and connect.",
    "超级球球户外场景": "Chio Chio outdoor scene",
    "四款超级球球在森林里的合影": "Four Chio Chio characters in a forest",
    "从家里到户外，球球都能成为孩子愿意带着走的陪伴": "From home to outdoors, Chio Chio becomes a companion children want to take along",
    "柔软可抱、可挂可携带的形态，让 AI 陪伴从屏幕里走出来，变成孩子熟悉、亲近、愿意分享心事的小伙伴。": "Soft, huggable, and portable, Chio Chio brings AI companionship out of the screen and into a familiar friend children trust.",
    "为什么超级球球值得信任": "Why Families Can Trust Chio Chio",
    "超级有爱以 AI 情绪疗愈为核心，把人工智能、物联网科技与专业心理学理论融合，打造让用户感受到爱的 AI 伙伴。": "Super YouAI centers on AI emotional healing, combining AI, IoT, and psychology to create AI companions that make users feel loved.",
    "核心团队覆盖人工智能、心理学、物联网、硬件和国际品牌管理。": "The core team spans AI, psychology, IoT, hardware, and international brand management.",
    "真实心理服务经验": "Real Psychological Service Experience",
    "创始团队长期参与公益心理服务，把技术理想落到真实人的需求里。": "The founding team has long participated in public-interest psychological services, grounding technical ideals in real human needs.",
    "产品进入量产阶段，计划于 2026 年美国 CES 全球首发。": "The product is entering mass production and is planned for a CES 2026 global debut.",
    "越来越多家庭愿意留下的温暖陪伴": "Warm companionship more families choose to keep",
    "首批家庭测试显示，超级球球不只是短暂的新鲜玩具，而是在持续互动中成为孩子愿意靠近、愿意倾诉的伙伴。": "Early family tests show Chio Chio is more than a short-lived novelty; through ongoing interaction, it becomes a companion children approach and confide in.",
    "这些数字说明，球球不是只被新鲜地玩一次，而是在日常互动里被孩子反复靠近。": "These numbers suggest Chio Chio is not played with once for novelty, but repeatedly approached by children in everyday interaction.",
    "首批真实家庭付费测试显示，超级球球不依赖短期新鲜感，而是通过持续的情绪价值与孩子建立关系。": "Early paid family tests show that Chio Chio is not just novelty; it builds relationships through sustained emotional value.",
    "真实家庭持续追踪测试": "families in ongoing tracking tests",
    "21 日对话留存率": "21-day conversation retention",
    "日均互动时长": "average daily interaction",
    "家长满意度反馈": "parent satisfaction score",
    "把超级球球带进更多孩子的日常": "Bring Chio Chio into more children’s daily lives",
    "让球球走进更多孩子的日常": "Bring Chio Chio into more children’s everyday life",
    "我们正在寻找理解亲子消费、教育场景与礼赠渠道的伙伴，一起把有温度的 AI 情绪陪伴带到更多家庭。": "We are looking for partners who understand parent-child consumption, education scenarios, and gifting channels to bring warm AI companionship to more families.",
    "超级球球在儿童活动空间陈列": "Chio Chio displayed in a children’s activity space",
    "新品类更好讲清楚": "A Clear New Category",
    "聚焦儿童情绪陪伴与性格养成，和常规玩具、教具形成差异化，方便伙伴建立推荐理由。": "Focused on emotional companionship and character building, it stands apart from ordinary toys and teaching aids.",
    "聚焦儿童情绪陪伴与性格养成，和常规玩具、教具形成差异化。": "Focused on emotional companionship and character building, distinct from ordinary toys or teaching aids.",
    "可爱 IP 带来亲近感": "Lovable IP Creates Affinity",
    "柔软可抱、可挂可携带的形态，让产品更容易进入门店陈列、亲子活动和礼赠场景。": "Soft, huggable, and portable, it fits naturally into retail displays, family events, and gifting.",
    "柔软可抱、可挂可携带，更容易进入陈列、活动和礼赠场景。": "Soft, huggable, and portable, it naturally fits displays, events, and gifting.",
    "贴近真实家庭需求": "Close to Real Family Needs",
    "围绕拖延、急躁、怕挫折、不敢表达等高频成长问题，让家长更容易理解产品价值。": "Built around common growth challenges such as procrastination, impatience, fear of setbacks, and difficulty expressing feelings.",
    "围绕拖延、急躁、怕挫折、不敢表达等真实成长问题。": "Built around real growth challenges such as procrastination, impatience, fear of setbacks, and difficulty expressing feelings.",
    "总部支持伙伴启动": "Headquarters Supports Launch",
    "提供产品素材、销售话术、培训内容、陈列建议和传播支持，帮助合作伙伴更快落地。": "We provide product assets, sales scripts, training, display guidance, and communication support.",
    "提供素材、话术、培训、陈列和传播支持，帮助伙伴快速落地。": "We provide assets, scripts, training, display guidance, and communication support for faster launch.",
    "适合有亲子客群、教育资源、礼赠渠道或区域服务能力的伙伴。": "Ideal for partners with family audiences, education resources, gifting channels, or local service capabilities.",
    "了解合作方式": "Explore Partnership",

    "孩子愿意说，\n父母看得见": "Children Open Up,\nParents See More",
    "孩子愿意说，": "Children Open Up,",
    "父母看得见": "Parents See More",
    "超级球球用 AI 情绪陪伴，帮助孩子表达情绪、疏导压力、养成好性格。": "Chio Chio uses AI emotional companionship to help children express feelings, ease stress, and build strong character.",
    "了解产品": "Explore Product",
    "不是多一个屏幕，是一个愿意听孩子说话的伙伴": "Not another screen, but a companion willing to listen",
    "超级球球把“倾听、共情、正向引导、正向强化”放进柔软可抱的陪伴机器人里。孩子愿意靠近，父母也更容易看见真实的情绪变化。": "Chio Chio puts listening, empathy, positive guidance, and reinforcement into a soft companion robot children want to approach.",
    "孩子愿意亲近": "Children Want to Approach",
    "柔软、有眼神、可拥抱。": "Soft, expressive, and huggable.",
    "父母更易理解": "Parents Understand More Easily",
    "互动沉淀为情绪线索。": "Interactions become emotional cues.",
    "习惯慢慢养成": "Habits Grow Gradually",
    "四类性格能力日常练习。": "Daily practice for four character strengths.",
    "一套产品，两种陪伴": "One Product Family, Two Companion Forms",
    "大球球适合家庭里的长期陪伴，小球球适合孩子带出门。一个建立深关系，一个延续安全感。": "The larger Chio Chio supports long-term companionship at home; the smaller one travels with children, extending a sense of safety.",
    "经典款 · 大球球": "Classic · Big Chio Chio",
    "放在书桌和床边，成为孩子每天都见得到的陪伴": "Place it by the desk or bed as an everyday companion",
    "面向居家陪伴、睡前安抚、学习压力和亲子沟通场景，承担更完整的 AI 情绪陪伴与性格养成体验。": "Designed for home companionship, bedtime comfort, study pressure, and parent-child communication.",
    "精灵版 · 小球球": "Sprite · Mini Chio Chio",
    "挂在书包上，把熟悉的安心感带到外面": "Clip it to a backpack and bring familiar comfort outside",
    "更轻巧、更适合礼赠和日常携带，让“口袋里的情绪小伙伴”进入校园、出游和社交场景。": "Lighter and easier to gift or carry, it brings a pocket-sized emotional companion into school, travel, and social scenes.",
    "四个颜色，四种孩子需要的成长力量": "Four Colors, Four Growth Strengths",
    "它不是一只“万能球球”，而是把孩子最常见的成长挑战拆成四个清晰选择，让购买理由、孩子偏爱和 IP 记忆点同时成立。": "It is not one all-purpose character; it turns common growth challenges into four clear choices with distinct reasons to love and remember.",
    "每个孩子都有自己的节奏。四只球球用不同的性格陪在身边，帮孩子慢慢练习专注、表达、勇敢和好好说话。": "Every child has their own pace. Four Chio Chio personalities stay close and gently help children practice focus, expression, courage, and kind communication.",
    "玉兔白 · 不拖拉球球": "Moon White\nStart-Now Chio Chio",
    "你不拖拉，我不拖拉，咱们都不拖拉": "No more putting things off, together.",
    "适合磨蹭、作业拖延、起床困难和习惯养成，陪孩子从“等一下”走向“先开始”。": "For dawdling, homework delay, hard mornings, and habit building.",
    "治愈粉 · 不暴躁球球": "Healing Pink\nCalm Chio Chio",
    "遇事不暴躁，温柔好好说": "Stay gentle, speak kindly.",
    "适合急躁、哭闹、顶嘴和冲动表达，帮助孩子先认识情绪，再好好说话。": "For impatience, crying, arguing, and impulsive expression.",
    "不蕉绿 · 小坚强球球": "Banana Green\nBrave Chio Chio",
    "勇敢不害怕，做个小坚强": "Be brave and grow resilient.",
    "适合怕失败、怕批评、受挫后退缩，陪孩子练习勇敢、自信和恢复力。": "For fear of failure, criticism, and retreat after setbacks.",
    "仙女蓝 · 小话唠球球": "Fairy Blue\nExpressive Chio Chio",
    "敢开口，爱表达，快乐交朋友": "Speak up, express, and make friends.",
    "适合内向、胆小、不敢表达，陪孩子完成社交破冰和表达练习。": "For shy or quiet children who need support starting conversations.",
    "8个陪伴动作，把情绪支持放进日常": "Eight companion actions bring emotional support into daily life",
    "把专业能力翻译成孩子能感受到的体验：听他说、懂情绪、会安慰、记得住，也能用眼神和触摸回应他。": "Professional capability becomes experiences children can feel: listening, understanding, comforting, remembering, eye contact, and touch.",
    "认真听他说": "Listen Carefully",
    "不打断、不评判，先让孩子把心里话说出来。": "No interruption or judgment; let children speak first.",
    "听懂小情绪": "Read Small Emotions",
    "从语气和内容里感知开心、委屈、焦虑和低落。": "Sense joy, hurt, anxiety, or sadness from tone and content.",
    "陪开心时刻": "Share Happy Moments",
    "在孩子分享和兴奋时及时回应，放大正向体验。": "Respond when children share excitement and amplify positive moments.",
    "安抚坏心情": "Soothe Bad Moods",
    "在受挫或难过时先接住情绪，再温柔引导。": "Hold the emotion first, then guide gently.",
    "练习好性格": "Practice Good Character",
    "把自律、稳定、勇敢和表达练习放进日常对话。": "Build self-discipline, steadiness, courage, and expression into daily conversation.",
    "记得他的事": "Remember What Matters",
    "记住孩子的兴趣、偏好和成长变化，陪伴更贴近。": "Remember interests, preferences, and changes so companionship feels personal.",
    "用眼神回应": "Respond with Eye Contact",
    "通过大眼睛和表情反馈，让孩子感到被看见。": "Big eyes and expressive feedback help children feel seen.",
    "抱一抱有反馈": "Hugs with Feedback",
    "触摸和拥抱都有回应，让安抚更真实可感。": "Touch and hugs receive responses, making comfort tangible.",
    "从书桌、床边到书包，陪伴发生在真实生活里": "From desk to bedside to backpack, companionship happens in real life",
    "它会出现在孩子写作业、睡前放松、想被安慰和出门分享的时刻，轻轻陪着孩子把心里的话说出来。": "It appears during homework, bedtime, moments of comfort, and days out, gently helping children say what is in their hearts.",
    "学习陪伴": "Study Companion",
    "写作业、复习和考前阶段，缓解压力，帮助孩子回到专注。": "Helps relieve pressure and return to focus during homework, review, and exams.",
    "情绪疗愈": "Emotional Comfort",
    "受挫、委屈和焦虑时，它先倾听，再给出温和的正向引导。": "When children feel hurt or anxious, it listens first, then gently guides.",
    "亲子沟通": "Parent-Child Communication",
    "把孩子难说出口的情绪变成家长更容易理解的沟通线索。": "Turns hard-to-say feelings into cues parents can understand.",
    "随身礼赠": "Portable Gift",
    "可挂可带，适合开学礼、生日礼、节日礼和亲子消费场景。": "Portable and giftable for school openings, birthdays, holidays, and family consumption.",
    "AI硬件是入口，治愈成长 IP 是长期资产": "AI hardware is the entry point; healing growth IP is the long-term asset",
    "超级球球不只卖一个硬件，而是以“原创治愈成长 AI 亲子 IP”为核心，连接家庭陪伴、校园文创、亲子消费和品牌联名。": "Chio Chio is more than hardware; it is an original healing-growth AI family IP connecting home companionship, campus culture, family consumption, and brand collaborations.",
    "AI 成长陪伴硬件": "AI growth companion hardware",
    "挂件与随身周边": "Clips and portable accessories",
    "礼盒与联名授权": "Gift boxes and co-brand licensing",

    "有爱AI让球球更懂孩子：先陪孩子愿意开口，再把日常互动里的情绪线索温和地反馈给家庭，帮助父母更早看见孩子的需要。": "YouAI helps Chio Chio understand children better: first helping them open up, then gently turning everyday emotional cues into insights families can notice earlier.",
    "自研面向心理陪伴场景的 AI 系统，以儿童家庭为首个落地场景，连接硬件陪伴、情绪感知、个性化反馈、家长协同与风险预警，构建长期情绪支持闭环。": "Our proprietary AI system for psychological companionship begins with children and families, connecting hardware, emotion sensing, personalization, parent collaboration, and risk alerts.",
    "有爱AI让球球更懂孩子：先陪孩子愿意开口，再把日常互动里的情绪线索温和地反馈给家庭，帮助父母更早看见孩子的需要。": "YouAI helps Chio Chio understand children better: first helping them feel willing to speak, then gently reflecting emotional cues from daily interactions back to the family.",
    "有爱AI能力闭环": "YouAI capability loop",
    "硬件陪伴": "Hardware Companion",
    "情绪感知": "Emotion Sensing",
    "共情沟通": "Empathic Communication",
    "家长协同": "Parent Collaboration",
    "风险预警": "Risk Alerts",
    "从一次对话，到长期成长陪伴": "From one conversation to long-term growth companionship",
    "不是通用聊天，而是家庭情绪支持闭环": "Not generic chat, but a family emotional-support loop",
    "孩子有时不知道怎么说，父母也未必第一时间接得住。有爱AI把倾听、理解、回应和家长协同连起来，让陪伴从一次聊天变成持续支持。": "Children do not always know how to say what they feel, and parents may not catch it immediately. YouAI connects listening, understanding, response, and parent collaboration so companionship becomes ongoing support.",
    "有爱AI围绕“孩子不会说，家长不会接”的真实痛点设计，让 AI 先成为孩子愿意靠近的伙伴，再帮助家庭更早理解状态变化。": "YouAI is designed around the real challenge of children not knowing how to say it and parents not knowing how to receive it.",
    "孩子有时不知道怎么说，父母也未必第一时间接得住。有爱AI把倾听、理解、回应和家长协同连起来，让陪伴从一次聊天变成持续支持。": "Children sometimes do not know how to say what they feel, and parents may not catch it immediately. YouAI connects listening, understanding, response, and parent collaboration so companionship becomes continuous support.",
    "柔软可抱、可触摸、有眼神反馈，让心理支持自然进入家庭日常。": "Soft, touchable, and expressive, it lets psychological support enter family life naturally.",
    "结合语义、语气、触摸、上下文与长期记录，识别孩子当下状态。": "It combines meaning, tone, touch, context, and long-term records to sense a child’s current state.",
    "用倾听、接纳、鼓励和正向引导，帮助孩子更安全地表达情绪。": "Listening, acceptance, encouragement, and positive guidance help children express emotions safely.",
    "通过家长端理解孩子心理成长状况，辅助亲子沟通，而非替代父母。": "The parent side helps understand growth and supports communication without replacing parents.",
    "在授权、脱敏、加密和家长可控的边界内，提示潜在负面风险。": "Within authorization, anonymization, encryption, and parent control, it flags potential risks.",
    "四层系统能力，让陪伴越用越懂孩子": "Four system layers make companionship smarter over time",
    "它不只记住孩子说过什么，也会理解孩子在什么场景下需要安慰、鼓励、提醒或陪伴，让每一次回应都更贴近孩子。": "It does not only remember what children say; it understands when they may need comfort, encouragement, reminders, or company, making each response feel closer.",
    "有爱AI不只记录“说了什么”，而是理解状态、场景、干预动作与变化结果之间的关系。": "YouAI does not only record words; it understands relationships between state, context, intervention, and change.",
    "它不只记住孩子说过什么，也会理解孩子在什么场景下需要安慰、鼓励、提醒或陪伴，让每一次回应都更贴近孩子。": "It does not just remember what a child said; it understands when they need comfort, encouragement, reminders, or quiet companionship.",
    "垂直心理场景理解": "Vertical Psychological Context",
    "围绕儿童、家庭、校园与社交关系进行能力设计，理解复杂情境下孩子真正需要的支持。": "Designed around children, families, school, and social relationships to understand what support is truly needed.",
    "多模态情绪识别": "Multimodal Emotion Recognition",
    "基于心理专家经验训练，结合语义、语气、触摸反馈、上下文与长期记录识别心理状态。": "Trained with psychological expertise, combining language, tone, touch feedback, context, and long-term records.",
    "长期记忆与个性化反馈": "Long-Term Memory & Personalization",
    "形成孩子兴趣、表达习惯、情绪轨迹和家庭互动画像，随陪伴时间增长提供千人千面的反馈策略。": "Builds profiles of interests, expression habits, emotional trajectories, and family interactions.",
    "安全边界与风险控制": "Safety Boundaries & Risk Control",
    "建立采集授权、脱敏加密、分级访问、可追溯审计和家长可控删除机制，让未成年人数据处理更审慎。": "Authorization, anonymization, encryption, tiered access, auditability, and parent-controlled deletion protect minors’ data.",
    "核心数据，是孩子状态如何被支持后发生变化": "The core data is how a child’s state changes after support",
    "有爱AI沉淀的是“用户当前状态 - 系统干预动作 - 行为场景 - 状态变化结果 - 后续状态迁移”的闭环数据，逐步建立心理活动与外部干预的因果链条。": "YouAI accumulates closed-loop data from current state, intervention, behavior context, state change, and later transitions.",
    "用户当前状态": "Current State",
    "系统干预动作": "System Intervention",
    "行为场景": "Behavior Context",
    "状态变化结果": "State Change",
    "后续状态迁移": "Later Transition",
    "状态数据": "State Data",
    "理解心理状态与认知负荷，构建持续更新的心理画像。": "Understands mental state and cognitive load to build an evolving profile.",
    "状态轨迹": "State Trajectory",
    "记录状态变化路径，解析负面情绪形成与恢复过程。": "Records change paths and analyzes how negative emotions form and recover.",
    "干预效果": "Intervention Effect",
    "学习“人-状态-干预”的最佳匹配，沉淀可复用的转移规则。": "Learns the best match between person, state, and intervention.",
    "行为可达性": "Behavioral Reachability",
    "识别孩子真正做得到的最小改变路径，让建议更可执行。": "Finds the smallest actionable steps a child can really take.",
    "个体动态模型": "Individual Dynamic Model",
    "长期理解情绪惯性、压力模式与恢复方式，形成一人一模型。": "Learns emotional inertia, stress patterns, and recovery methods over time.",
    "系统自我进化": "System Self-Evolution",
    "通过真实陪伴反馈持续优化响应策略，让系统越用越贴近个体。": "Real companionship feedback continuously improves response strategies.",
    "核心数据：用户状态变化数据": "Core Data: User State Transition Data",
    "看见孩子情绪变化的路径": "See the path of a child’s emotional changes",
    "我们关注的不是冰冷数据，而是孩子什么时候更放松、什么时候愿意表达、什么样的陪伴真的有帮助。": "We care less about cold data and more about when a child relaxes, when they are willing to express themselves, and what kind of companionship truly helps.",
    "六大核心数据 · 构建用户心理 DNA": "Six core data layers · Building a user's psychological DNA",
    "01. 状态数据 (State Data)": "01. State Data",
    "02. 状态轨迹 (State Trajectory)": "02. State Trajectory",
    "记录变化路径，解析负面情绪形成与恢复过程。": "Records transition paths and analyzes how negative emotions form and recover.",
    "03. 干预效果数据 (Intervention Data)": "03. Intervention Data",
    "学习“人-状态-干预”的最佳匹配，沉淀转移规则库。": "Learns the best person-state-intervention match and builds a reusable transition rule library.",
    "04. 行为可达性 (Behavior Reachability)": "04. Behavior Reachability",
    "量化用户的最小阻力改变路径，让建议真正可执行。": "Quantifies the lowest-friction path to change, making guidance truly actionable.",
    "05. 个体动态模型 (Personal Dynamics)": "05. Personal Dynamics",
    "长期形成情绪惯性与恢复方式，建立“一人一模型”。": "Learns emotional inertia and recovery patterns over time, creating a model for each individual.",
    "06. 强化学习数据 (RL Data)": "06. Reinforcement Learning Data",
    "基于真实陪伴反馈持续优化响应策略，支持系统自我进化。": "Uses real companionship feedback to continuously improve responses and support self-evolution.",
    "数据结构动态闭环": "Dynamic Closed Loop Data Structure",
    "用户当前状态｜系统干预动作｜行为场景｜状态变化结果｜后续状态迁移": "Current state | System intervention | Behavior context | State-change outcome | Later transition",
    "建立心理和外部干预因果链条": "Build causal links between psychology and external intervention",
    "不只记录“说了什么”，而是还原心理活动与外部干预的因果链条。": "It does not merely record what was said; it reconstructs causal links between mental activity and external intervention.",
    "Psyche-Hypercube": "Psyche-Hypercube",
    "核心技术：六维心理超空间计算引擎": "Core Technology: Six-Dimensional Psychological Hyperspace Computing Engine",
    "把复杂情绪，翻译成温和可执行的陪伴": "Translate complex emotions into gentle, actionable companionship",
    "技术在后台处理复杂判断，孩子感受到的是更合适的一句话、一次鼓励、一个提醒，或一段安静的陪伴。": "The technology handles complex judgment in the background; what children feel is a better sentence, a timely encouragement, a reminder, or a quiet moment of companionship.",
    "Psyche-Hypercube 核心架构": "Psyche-Hypercube Architecture",
    "六维心理空间 Ω6": "Six-Dimensional Psychological Space Ω6",
    "情绪效价": "Emotional valence",
    "唤醒强度": "Arousal intensity",
    "认知负荷": "Cognitive load",
    "社交趋避": "Social approach",
    "时间知觉": "Time perception",
    "自我边界": "Self-boundary",
    "从状态识别到温和回应": "From sensing state to gentle response",
    "语义理解": "Meaning",
    "空间映射": "Mapping",
    "状态解码": "State decoding",
    "平衡点求解": "Balance point",
    "陪伴策略": "Companion response",
    "看见陪伴是否真的有帮助": "See whether support truly helps",
    "持续观察情绪改善、表达意愿和恢复速度，让下一次回应更贴近孩子。": "Emotional improvement, willingness to express, and recovery pace help make the next response feel closer.",
    "行业首创的拓扑心理学 AI 框架，将模糊的心理状态转化为可计算、可导航的精确空间。": "An original topological psychology AI framework that turns ambiguous mental states into computable, navigable space.",
    "6维心理空间 Ω6": "6D Psychological Space Ω6",
    "读懂当下状态": "Read the current state",
    "从表达、语气、触摸和长期记录里，判断孩子更需要安慰、陪伴还是鼓励。": "Uses expression, tone, touch, and long-term records to understand whether a child needs comfort, company, or encouragement.",
    "D1 情绪效价 / D2 唤醒强度 / D3 认知负荷 / D4 社交趋避 / D5 时间知觉 / D6 自我边界": "D1 emotional valence / D2 arousal intensity / D3 cognitive load / D4 social approach-avoidance / D5 time perception / D6 self-boundary",
    "情绪效价、唤醒强度、认知负荷、社交趋避、时间知觉、自我边界。": "Emotional valence, arousal intensity, cognitive load, social approach-avoidance, time perception, and self-boundary.",
    "实时计算流水线": "Real-Time Computing Pipeline",
    "选择合适回应": "Choose the right response",
    "把复杂判断转化成孩子听得懂、愿意接受、能够做到的小步骤。": "Turns complex judgment into small steps a child can understand, accept, and act on.",
    "疗愈效果反馈": "Healing-Effect Feedback",
    "持续变得更贴近": "Keep becoming more personal",
    "根据孩子后续的情绪变化和互动反馈，不断优化陪伴方式。": "Continuously improves companionship based on later emotional changes and interaction feedback.",
    "以情绪改善、表达意愿、恢复速度等反馈持续优化响应。": "Continuously optimizes responses through feedback such as emotional improvement, willingness to express, and recovery speed.",
    "以情绪改善、表达意愿、恢复速度等真实反馈持续优化。": "Continuously optimizes through real feedback such as emotional improvement, willingness to express, and recovery speed.",
    "Psyche-Hypercube 核心架构": "Psyche-Hypercube core architecture",
    "看见孩子情绪变化的路径": "Seeing how a child’s emotions change",
    "我们关注的不是冰冷数据，而是孩子什么时候更放松、什么时候愿意表达、什么样的陪伴真的有帮助。": "What matters is not cold data, but when a child feels more relaxed, when they are willing to express, and what kind of companionship truly helps.",
    "把复杂情绪，翻译成温和可执行的陪伴": "Turning complex emotions into gentle, actionable companionship",
    "技术在后台处理复杂判断，孩子感受到的是更合适的一句话、一次鼓励、一个提醒，或一段安静的陪伴。": "The technology handles complexity in the background; what children feel is the right sentence, encouragement, reminder, or quiet companionship.",
    "读懂当下状态": "Understand the current state",
    "从表达、语气、触摸和长期记录里，判断孩子更需要安慰、陪伴还是鼓励。": "From expression, tone, touch, and long-term records, it senses whether a child needs comfort, company, or encouragement.",
    "选择合适回应": "Choose the right response",
    "把复杂判断转化成孩子听得懂、愿意接受、能够做到的小步骤。": "It turns complex judgment into small steps children can understand, accept, and try.",
    "持续变得更贴近": "Keep getting closer",
    "根据孩子后续的情绪变化和互动反馈，不断优化陪伴方式。": "It keeps improving companionship based on emotional changes and interaction feedback.",
    "从“情绪描述”到“状态计算”": "From Emotional Description to State Computation",
    "有爱AI把一次对话中的语义、语气、行为场景和长期记忆映射到心理状态空间，再根据孩子当下可承受的改变半径，生成更温和、更可执行的陪伴策略。": "YouAI maps semantics, tone, behavior context, and long-term memory into psychological state space, then generates gentler and more actionable companionship strategies based on what a child can bear at that moment.",
    "超级球球，是有爱AI在儿童家庭场景的第一款产品": "Chio Chio is the first YouAI product for children and families",
    "面向 5-12 岁儿童，超级球球把自然语音对话、智能情绪识别、积极陪伴、负面情绪疏导、优秀性格养成、长期记忆、眼神互动和触感回应整合为日常可感知的陪伴体验。": "For children aged 5 to 12, Chio Chio integrates voice dialogue, emotion recognition, positive companionship, emotional support, character building, memory, eye interaction, and touch feedback.",
    "孩子愿意说": "Children Open Up",
    "具象化、拟人化、可触摸的硬件形态，降低表达门槛，让孩子更愿意主动倾诉。": "A tangible, personified, touchable form lowers the barrier to expression.",
    "家长更早懂": "Parents Understand Earlier",
    "通过家长端协同与状态反馈，帮助父母更早理解孩子的情绪变化和沟通需求。": "Parent collaboration and state feedback help families understand children earlier.",
    "陪伴更持续": "Companionship Lasts",
    "长期记忆让陪伴不止于一次对话，而是逐步理解孩子的习惯、压力和成长节奏。": "Long-term memory turns companionship into an evolving understanding of habits, pressure, and growth rhythm.",
    "边界更清晰": "Clearer Boundaries",
    "产品目标不是替代父母或治疗，而是成为家庭情绪支持的轻量级基础设施。": "The product does not replace parents or therapy; it is lightweight emotional-support infrastructure for families.",

    "成为超级球球合作伙伴": "Become a Chio Chio Partner",
    "超级球球兼具 AI 陪伴价值、可爱 IP 形象和礼赠属性，适合亲子、教育、礼品、潮玩零售与区域渠道共同拓展。": "Chio Chio combines AI companionship, a lovable IP, and giftability, making it suitable for family, education, gifting, retail, and regional channels.",
    "为什么选择超级球球？": "Why Chio Chio?",
    "儿童情绪陪伴与性格养成正在成为家庭刚需，超级球球用可爱 IP、AI 心理模型和全场景礼赠属性，帮助伙伴切入更稀缺、更有复购潜力的亲子消费赛道。": "Children’s emotional companionship and character building are becoming family essentials. Chio Chio helps partners enter a scarce and repeatable family-consumption category.",
    "AI 与心理学能力支撑": "AI and Psychology Capability",
    "自研有爱 AI 心理陪伴系统，结合情绪识别、共情对话和长期记忆，形成产品体验壁垒。": "The proprietary YouAI system combines emotion recognition, empathic dialogue, and long-term memory.",
    "总部合作支持": "Headquarters Support",
    "物料支持": "Marketing Materials",
    "提供产品图、品牌素材、招商资料、终端陈列和活动素材。": "Product images, brand assets, partnership materials, display and event assets.",
    "培训支持": "Training Support",
    "提供产品话术、销售异议处理和渠道培训内容。": "Sales scripts, objection handling, and channel training.",
    "传播支持": "Communication Support",
    "配合线上线下传播、展会活动、达人内容和品牌联合营销。": "Online/offline campaigns, exhibitions, creator content, and co-marketing.",
    "诚邀全国合作伙伴": "Inviting Partners Nationwide",
    "超级球球面向儿童心理健康与成长陪伴赛道，适合有本地资源、亲子客群、礼赠渠道或社群影响力的伙伴共同拓展。": "Chio Chio is for partners with local resources, family audiences, gifting channels, or community influence.",
    "我们寻找的不是短期铺货，而是长期共建": "We are not looking for short-term distribution, but long-term co-building",
    "适合拥有亲子客群、教育资源、礼赠渠道、区域服务能力或品牌联合资源的伙伴。": "Ideal for partners with family audiences, education resources, gifting channels, regional service capability, or co-branding resources.",
    "Partner with Chio Chio": "Partner with Chio Chio",
    "新消费品类窗口": "A New Consumer Category Window",
    "儿童情绪陪伴与性格养成正在成为家庭刚需，合作伙伴可以更早占位一个有复购、有内容、有故事的新赛道。": "Children’s emotional companionship and character building are becoming family essentials; partners can enter a repeatable, content-rich, story-driven category earlier.",
    "可被陈列的高感知产品": "A High-Perception Product for Display",
    "柔软可抱、可挂可携带、可形成亲子体验，让产品更容易进入门店、活动、礼赠和本地服务场景。": "Soft, huggable, portable, and experience-driven, the product fits naturally into retail, events, gifting, and local service scenarios.",
    "总部陪跑落地": "Headquarters Support for Launch",
    "提供品牌素材、销售话术、培训内容、终端陈列和传播支持，帮助伙伴更稳地完成启动。": "We provide brand assets, sales scripts, training, retail display guidance, and marketing support for a steadier launch.",
    "母婴门店老板": "Mother-and-Baby Stores",
    "补充高客单、高复购的差异化产品。": "Add a differentiated product with higher basket value and repeat potential.",
    "教培转型者": "Education Business Transformers",
    "寻找轻资产、高毛利的转型方向。": "A lighter-asset, higher-margin transformation direction.",
    "宝妈创业者": "Mom Entrepreneurs",
    "时间灵活，产品自用+分享双重价值。": "Flexible timing with both personal use and sharing value.",
    "本地礼品商": "Local Gift Retailers",
    "送礼高频、场景丰富的优质选品。": "A quality gift option for many high-frequency scenarios.",
    "社群团购主理人": "Community Commerce Leaders",
    "口碑产品、自发传播属性强。": "A word-of-mouth product with natural sharing potential.",
    "个人创业者": "Individual Entrepreneurs",
    "低门槛入局，全程扶持。": "A low-threshold entry with support throughout.",
    "一起做一件有温度、有价值的事": "Build something warm and valuable together",
    "如果你拥有亲子客群、教育资源、礼赠渠道或区域服务能力，欢迎和我们聊聊如何把超级球球带到更多家庭。": "If you have family audiences, education resources, gifting channels, or regional service capability, let’s talk.",
    "立即咨询合作": "Contact for Partnership",

    "产品进展、行业活动、媒体关注与合作动态。": "Product progress, industry events, media attention, and partnership updates.",
    "超级有爱受邀参加芯生万象生态大会，分享 AIoT 如何赋能心理健康行业": "Super YouAI invited to the Xinsheng Wanxiang ecosystem conference to share how AIoT empowers mental health",
    "记录超级球球走向更多家庭的每一步，也分享我们对 AI 陪伴与儿童成长的持续探索。": "Follow Chio Chio’s steps toward more families, and our ongoing exploration of AI companionship and child growth.",
    "产品进展、行业活动、媒体关注与合作动态。": "Product progress, industry events, media coverage, and partnership updates.",
    "聚焦 AIoT、情绪健康与心理陪伴场景，呈现超级有爱在行业生态中的最新声音。": "A look at Super YouAI’s latest voice in AIoT, emotional health, and psychological companionship.",
    "阅读全文": "Read More",
    "更多动态": "More Stories",
    "AI情绪疗愈机器人“超级球球”参展第八届进博会，获多位中外贵宾亲身体验": "AI emotional-healing robot Chio Chio appears at the 8th CIIE and is experienced by Chinese and international guests",
    "英国驻华贸易副使节 Sohail Shaikh：“每个人都需要一台超级球球！”": "UK Deputy Trade Commissioner Sohail Shaikh: “Everyone needs a Chio Chio!”",
    "“超级球球”晋级 AI Agent 2025 大赛线下半决赛，并荣获“最具人文温度奖”！": "Chio Chio advances to the AI Agent 2025 offline semi-final and wins the Most Humane Warmth Award",
    "“超级球球”走进宜城市青年教师心理素养培训班": "Chio Chio enters Yicheng’s young teacher psychological literacy training",
    "超级有爱荣获“2025值得关注的AI创变者”": "Super YouAI named a 2025 AI Changemaker to Watch",
    "超级有爱与深度求解达成战略合作": "Super YouAI reaches strategic partnership with DeepTackle",
    "“超级球球”成为 AI Agent 2025 大赛官方推荐项目！": "Chio Chio becomes an official recommended project of AI Agent 2025",
    "“超级球球”疗愈级 AI 机器人亮相 IOTE 深圳物联网展，引线上线下围观潮": "Chio Chio healing AI robot debuts at IOTE Shenzhen, drawing online and offline attention",
    "“超级球球”团队受邀参加 AI Agent 2025 全球专项赛启动仪式": "Chio Chio team invited to the AI Agent 2025 Global Special Competition launch",
    "超级有爱智能科技创始人元晓帅博士拜访清华大学未来实验室": "Founder Dr. Yuan Xiaoshuai visits Tsinghua University Future Laboratory",
    "“超级球球”团队获得「文三×光圈 AI TED」创赛路演第一名！": "Chio Chio team wins first place at the Wensan × Light Cone AI TED startup roadshow",
    "超级有爱智能科技正式落户杭州未来科技城！": "Super YouAI officially settles in Hangzhou Future Sci-Tech City",
    "超级有爱受邀参加亚马逊云与亿极中国联合主办的 Agentic AI 研讨": "Super YouAI invited to an Agentic AI seminar co-hosted by AWS and EGG China",
    "客服、售后、投资合作与渠道合作，都可以从这里找到我们。": "Customer care, after-sales support, investment, strategic partnerships, and channel cooperation all start here.",
    "感谢你愿意花时间告诉我们真实感受。无论是合作咨询、产品建议、体验反馈或投诉，我们都会认真倾听并尽快回应。": "Thank you for sharing what you truly feel. Whether it is a partnership inquiry, product suggestion, experience feedback, or complaint, we will listen carefully and respond as soon as we can.",
    "任何不满意\n我们全解决": "If anything feels wrong,\nwe will make it right",
    "任何不满意 我们全解决": "If anything feels wrong, we will make it right",
    "任何不满意": "If anything feels wrong",
    "我们全解决": "we will make it right",
    "使用、售后、体验建议或任何问题，都欢迎第一时间联系我们。": "For usage questions, after-sales support, experience feedback, or any issue at all, contact us anytime.",
    "客服二维码": "Customer service QR code",
    "投资、战略合作": "Investment & Strategic Partnerships",
    "创始人 元晓帅": "Founder Vivian Yuan",
    "大客户、渠道合作": "Key Accounts & Channel Partnerships",
    "销售总监 何昌耀": "Sales Director He Changyao",
    "销售总监 高丽春": "Sales Director Gao Lichun",
    "电话 / 微信：": "Phone / WeChat: ",
    "手机 / 微信：": "Mobile / WeChat: ",
    "微信二维码待补充": "WeChat QR coming soon",
    "客服支持": "Customer Support",
    "产品咨询、售后与合作转接": "Product inquiries, after-sales support, and partnership routing",
    "邮箱待定": "Email to be confirmed",
    "扫码下载 Chio Chio APP，或通过邮箱联系我们咨询合作。": "Scan to download the Chio Chio app, or contact us by email for partnership inquiries.",
    "APP 下载": "App Download",
    "请将正式二维码图片放入 assets 目录后替换占位二维码。": "Place the official QR image in the assets folder to replace this placeholder.",
    "合作方向：渠道代理、城市合伙、IP 联名、产品与供应链合作、媒体合作。": "Cooperation areas: channel agency, city partnership, IP co-branding, product and supply-chain partnership, and media cooperation.",
    "返回品牌资讯": "Back to News",
    "上一篇": "Previous",
    "下一篇": "Next",
    "浏览量 50": "Views 50",
    "浏览量 86": "Views 86",
    "浏览量 90": "Views 90",
    "浏览量 80": "Views 80",
    "浏览量 76": "Views 76",
    "浏览量 75": "Views 75",
    "浏览量 73": "Views 73",
    "浏览量 72": "Views 72",
    "浏览量 71": "Views 71",
    "浏览量 70": "Views 70",
    "浏览量 69": "Views 69",
    "浏览量 68": "Views 68",
    "浏览量 66": "Views 66",
    "浏览量 62": "Views 62"
  };

  Object.assign(TEXT_EN, {
    "深圳南山区清华大学研究院新大楼A栋13层A08": "A08, 13F, Building A, Tsinghua Research Institute New Building, Nanshan District, Shenzhen",
    "超级球球，\n送孩子一生好性格": "Chio Chio,\nA Lifelong Character Companion",
    "超级球球，": "Chio Chio,",
    "送孩子一生好性格": "A Lifelong Character Companion",
    "它是一款 AI 儿童成长陪伴机器人，培养孩子的抗挫力、社交力、好心态和专注力。": "An AI growth companion robot for children, helping build resilience, social skills, a positive mindset, and focus.",
    "把拖延、急躁、怕挫折和不敢表达，变成孩子听得懂的成长伙伴": "Turn procrastination, impatience, fear of setbacks, and difficulty expressing into growth companions children understand.",
    "记住孩子的兴趣、表达习惯和成长变化，让关系与情感持续沉淀。": "Remembers interests, expression habits, and growth changes so relationships and emotions can deepen over time.",
    "产品已进入量产阶段，并于 2026 年完成京东、抖音国内首发，同步启动新加坡全球首发。": "The product has entered mass production, with domestic launches on JD and Douyin in 2026 and a global debut starting in Singapore.",
    "京东、抖音国内首发，新加坡全球首发": "Domestic launch on JD and Douyin, global debut in Singapore",
    "两种产品，陪伴孩子不同场景": "Two Products for Different Companion Moments",
    "两种产品\n陪伴孩子不同场景": "Two Products\nDifferent Companion Moments",
    "四大附加能力": "Four Added Capabilities",
    "不止情绪陪伴，也把听、说、看、玩、学习成长覆盖进孩子每天的生活。": "Beyond emotional companionship, Chio Chio also supports listening, speaking, watching, play, and learning in daily life.",
    "英语智能陪练": "Smart English Practice",
    "沉浸式口语互动，纠正发音，在趣味场景里轻松练习表达。": "Immersive spoken interaction and pronunciation support through playful scenarios.",
    "趣味故事畅听": "Story Listening",
    "睡前、休息和亲子时光里，用故事陪孩子安静下来。": "Stories help children settle down at bedtime, during breaks, and in family moments.",
    "高清音乐播放": "Hi-Fi Music Playback",
    "儿歌、轻音乐和经典曲目随心播放，舒缓身心，陶冶情操。": "Play nursery rhymes, light music, and classics to soothe the body and mind.",
    "全维认知探索": "Full-Spectrum Exploration",
    "一站式听、说、看、玩体验，拓宽孩子对世界的好奇心。": "An integrated listen, speak, watch, and play experience that expands curiosity.",
    "真实成长场景里，球球帮孩子把情绪说出来": "In Real Growth Moments, Chio Chio Helps Children Name Their Feelings",
    "从社交受挫、亲子沟通、睡前放松到考试失利，超级球球先接住孩子的感受，再给出温和的下一步。": "From social setbacks and family communication to bedtime and exam disappointment, Chio Chio first receives the feeling, then offers a gentle next step.",
    "高情商社交伙伴": "Social-Emotional Companion",
    "被冷落、想加入小组却害怕被拒绝时，球球先共情，再陪孩子练习更自然的表达。": "When children feel left out or fear rejection, Chio Chio empathizes first, then helps practice natural expression.",
    "亲子关系沟通使者": "Parent-Child Communication Bridge",
    "作业、拖延、冲突后的僵局里，球球帮双方先降温，再把情绪翻译成能被理解的话。": "In moments of homework conflict or procrastination, Chio Chio helps cool things down and translate feelings into understandable words.",
    "健康哄睡陪伴": "Healthy Bedtime Companion",
    "用语音聊天、故事和温暖声音替代睡前屏幕，让孩子更安心地进入睡眠。": "Voice chats, stories, and warm sound replace bedtime screens and help children sleep more peacefully.",
    "受挫后的信心加油站": "Confidence After Setbacks",
    "考试失利、比赛落选或被同伴排斥时，球球给孩子无条件接纳和过程化肯定。": "After exams, competitions, or peer rejection, Chio Chio offers unconditional acceptance and process-based encouragement.",
    "有温度的礼赠选择": "A Warm Gift Choice",
    "适合开学礼、生日礼、节日礼和亲子渠道，把陪伴价值带进真实家庭。": "A thoughtful gift for school openings, birthdays, holidays, and family channels.",
    "获得国家级大奖": "National-Level Awards",
    "超级有爱团队在 AI 创新、智能硬件和情绪陪伴方向持续获得专业赛事与行业机构认可。": "The Super YouAI team continues to earn recognition in AI innovation, smart hardware, and emotional companionship.",
    "杭州 AI TED 科技路演第一名": "Hangzhou AI TED Roadshow First Place",
    "Demo China AI 创变者奖": "Demo China AI Innovation Award",
    "AI Agent 2025 三等奖": "AI Agent 2025 Third Prize",
    "AI Agent 2025 最具人文温度奖": "AI Agent 2025 Most Human-Centered Award",
    "五小创新十佳成果": "Top Ten Small Innovations",
    "有爱AI自研儿童心理陪伴系统，融合多模态情绪识别、长期记忆、个性化反馈与家长协同，让硬件陪伴从对话走向可持续的情绪支持闭环。": "YouAI is a proprietary child psychological companionship system combining multimodal emotion recognition, long-term memory, personalized feedback, and parent collaboration.",
    "把情绪信号转化为可执行的陪伴策略": "Turn Emotional Signals into Actionable Companion Strategies",
    "系统把语义、语气、触摸、行为场景和长期记忆映射到孩子的心理状态空间，再计算更合适的回应方式。孩子感受到的是一句安慰、一次鼓励或一个提醒，背后是持续学习的陪伴策略。": "The system maps meaning, tone, touch, context, and long-term memory into a child’s psychological state space, then calculates a better response strategy.",
    "从状态识别到陪伴策略": "From State Recognition to Companion Strategy",
    "持续优化下一次回应": "Continuously Optimize the Next Response",
    "成为超级球球合作伙伴，一起改变世界": "Become a Chio Chio Partner and Change the World Together",
    "提供产品话术、销售异议处理、门店导购培训和渠道启动内容。": "Provides product scripts, objection handling, store guide training, and channel launch content.",
    "陈列支持": "Display Support",
    "提供空间陈列建议、样机体验方案、亲子活动脚本和本地化展示参考。": "Provides display guidance, demo experience plans, family event scripts, and local showcase references.",
    "配合线上线下传播、展会活动、达人内容、品牌联合营销和区域曝光。": "Supports online and offline communication, exhibitions, creator content, co-marketing, and regional exposure.",
    "售后支持": "After-Sales Support",
    "提供客服承接、问题反馈、产品使用指引和持续迭代信息同步。": "Provides customer service handoff, issue feedback, usage guidance, and product iteration updates.",
    "灵活合作模式": "Flexible Partnership Models",
    "渠道代理、城市合伙、礼赠团购、亲子活动、教育场景和品牌联名都可以展开沟通。": "Channel agency, city partnership, gifting group buys, family events, education scenarios, and co-branding are all open for discussion.",
    "喜讯！超级有爱荣获 CFS2026 高成长价值企业称号": "Good News: Super YouAI Named a CFS 2026 High-Growth Value Enterprise",
    "超级有爱荣获 CFS2026 高成长价值企业称号": "Super YouAI Named a CFS 2026 High-Growth Value Enterprise",
    "凭借儿童情绪陪伴 AI 硬件方向的技术创新、产品落地与长期成长潜力，超级有爱获得第十五届财经峰会组委会认可。": "Recognized by the 15th China Finance Summit for innovation, product execution, and long-term growth potential in AI hardware for children’s emotional companionship.",
    "CFS2026 第十五届财经峰会获评通知": "CFS 2026 Award Notification from the 15th China Finance Summit",
    "超级球球 AI 陪伴机器人产品能力展示": "Chio Chio AI companion robot capability showcase",
    "感谢你愿意花时间告诉我们真实感受。": "Thank you for taking the time to share what you really feel.",
    "无论是合作咨询、产品建议、体验反馈或投诉，我们都会认真倾听并尽快回应。": "Whether it is a partnership inquiry, product suggestion, experience feedback, or complaint, we will listen carefully and respond as soon as we can.",
    "感谢你愿意花时间告诉我们真实感受。\n无论是合作咨询、产品建议、体验反馈或投诉，我们都会认真倾听并尽快回应。": "Thank you for sharing what you really feel.\nFor partnerships, product suggestions, feedback, or complaints, we listen carefully and respond as soon as we can.",
    "创始人": "Founder",
    "元晓帅博士": "Dr. Xiaoshuai Yuan",
    "创始人 元晓帅博士": "Founder Dr. Xiaoshuai Yuan",
    "渠道合作": "Channel Partnerships",
    "销售总监": "Sales Director",
    "何昌耀": "Changyao He",
    "销售总监 何昌耀": "Sales Director Changyao He"
  });

  const ARTICLE_EN = {
    "20260707": {
      title: "Good News: Super YouAI Named a CFS 2026 High-Growth Value Enterprise",
      summary: "Recognized by the 15th China Finance Summit for innovation, product execution, and long-term growth potential in AI hardware for children’s emotional companionship.",
      body: [
        "Recently, the organizing committee of the 15th China Finance Summit issued its award notification, naming Super YouAI (Hangzhou) Intelligent Technology Co., Ltd. a “2026 High-Growth Value Enterprise.” With the theme “Global Vision, China’s Resilience,” this year’s summit brings together more than a thousand representatives from business, academia, and government, with outstanding companies across industries participating in the selection.",
        "The evaluation considered multiple dimensions including core technology, R&D innovation, market implementation, and long-term growth potential. Since its founding, Super YouAI has focused on AI hardware for children’s emotional companionship, putting independent R&D at the center of its development and continuing to build differentiated parent-child intelligent products.",
        "Previously, the company’s core product Chio Chio appeared at the Luohu AI Intelligent Hardware Innovation Day and won both the Best Design Award and the Best Experience Award after live voting by guests who experienced the product firsthand. The result further validated the team’s strengths in product design and human-computer interaction.",
        "This authoritative recognition highlights Super YouAI’s innovation and growth value. Founded more than ten years ago, the CFS China Finance Summit has gathered hundreds of mainstream media outlets and influential speakers, continuously witnessing the development of innovative Chinese enterprises. In this selection, the committee placed particular emphasis on intellectual-property reserves, sustained R&D investment, and the real-world implementation of innovative products.",
        "Standing out among many participating companies and receiving the “High-Growth Value Enterprise” title is both an affirmation of Super YouAI’s technology path and business model, and a recognition from the market and capital ecosystem of the potential of children’s AI hardware and the company’s core competitiveness.",
        "Honor is a milestone; innovation is the enduring foundation. Going forward, Super YouAI will continue to deepen its work in children’s intelligent hardware, increase investment in artificial intelligence, child-computer interaction, and smart hardware, improve product experience, strengthen its intellectual-property portfolio, and use self-developed core technologies to create AI companionship products better suited to the needs of families.",
        "We will stay true to the original intention of technological innovation, support the development of new quality productive forces through solid R&D capability, and continue building warm, technically capable intelligent products for children."
      ]
    },
    "8854015": {
      title: "Super YouAI invited to Xinsheng Wanxiang ecosystem conference to share how AIoT empowers mental health",
      summary: "A look at Super YouAI’s latest thinking on AIoT, emotional health, and psychological companionship.",
      body: [
        "On November 28, Super YouAI was invited to the 2025 TPUNB Technology Ecosystem Conference hosted by its strategic partner Gixin Technology. Founder Dr. Yuan Xiaoshuai delivered a keynote titled “From the Internet of Everything to Empathy of Everything: How AIoT Will Reshape Mental Health.”",
        "Gixin Technology is a leading domestic IoT company and a national-level specialized and innovative enterprise. Chio Chio, Super YouAI’s first AI emotional-healing robot, uses Gixin’s IoT chip and has the potential to connect with more smart devices without relying on a network, opening new possibilities for AIoT-based emotional support.",
        "In his keynote, Dr. Yuan used Chio Chio as an example to discuss four core AIoT scenarios for psychological services, explaining how the combination of AI and IoT can reshape the mental-health industry.",
        "He noted that IoT gives AI a richer set of sensory touchpoints, turning abstract care into companionship users can truly feel. Together, AI and IoT can move mental-health services from subjective questionnaires to precise sensing, from appointment-based waiting to instant companionship, from therapist-only work to human-machine collaboration, and finally toward healing within daily life.",
        "The vision was well received by experts and business leaders at the conference. Super YouAI will continue working with ecosystem partners such as Gixin Technology to deepen AIoT applications in mental health and build warmer intelligent psychological services."
      ]
    },
    "8831625": {
      title: "AI emotional-healing robot Chio Chio appears at the 8th CIIE and is experienced by Chinese and international guests",
      summary: "Chio Chio showcased AI emotional healing and companionship at the China International Import Expo.",
      body: [
        "On November 5, the 8th China International Import Expo opened at the National Exhibition and Convention Center in Shanghai. Chio Chio, the first AI emotional-healing robot developed by Super YouAI, attracted strong interest from domestic and international visitors.",
        "Chio Chio features a plush exterior, touch interaction, and voice conversation. Powered by a healing model trained by psychology experts with more than 20 years of experience and AI specialists, it can recognize emotions through dialogue, offer understanding and empathy, and help users move through emotional distress.",
        "Many visitors were drawn in by its soft and adorable appearance. After learning that Chio Chio can help people ease negative emotions through conversation, many asked about purchase channels and expressed interest in future availability.",
        "On November 6, UK Deputy Trade Commissioner Sohail Shaikh visited the Chio Chio booth, spoke with the team, and experienced the product. When Chio Chio introduced itself in English and said it could help chase away bad moods, he smiled and said, “Everyone needs Chio Chio!”",
        "Several local leaders also visited the booth to learn about the application of AI in real-world scenarios. The team’s goal of helping more people reduce emotional distress and improve well-being received recognition and encouragement."
      ]
    },
    "8831624": {
      title: "UK Deputy Trade Commissioner Sohail Shaikh: “Everyone needs a Chio Chio!”",
      summary: "International guests experienced Chio Chio and its English conversation ability at CIIE.",
      body: [
        "During the 8th China International Import Expo, UK Deputy Trade Commissioner Sohail Shaikh visited the Chio Chio booth and exchanged ideas with the team.",
        "Founder Dr. Yuan Xiaoshuai introduced Chio Chio as an AI emotional-healing robot designed to help people ease negative emotions, reduce stress, and feel better through warm conversation.",
        "Dr. Yuan then asked Chio Chio to introduce itself in English. With its childlike voice, Chio Chio immediately began speaking and explained that it could help people chase away bad moods.",
        "After listening, Mr. Shaikh smiled and said, “Everyone needs Chio Chio!” The moment showed how naturally the product’s emotional companionship can cross language and cultural boundaries."
      ]
    },
    "8831623": {
      title: "Chio Chio advances to the AI Agent 2025 offline semi-final and wins the Most Humane Warmth Award",
      summary: "Chio Chio received recognition for both technical capability and human-centered warmth.",
      body: [
        "According to AI Agent 2025 competition updates, Super YouAI’s Chio Chio project advanced from the first online points round to the offline semi-final on October 27.",
        "Chio Chio also received the special Most Humane Warmth Award, recognizing its focus on emotional support, companionship, and practical care for users.",
        "The project combines AI, psychology, hardware, and a tangible companion form. Its goal is not only to demonstrate technology, but to make psychological support more accessible, private, and emotionally acceptable.",
        "For Super YouAI, the award validates the team’s long-term direction: building AI products that are technically credible and deeply human."
      ]
    },
    "8790613": {
      title: "Chio Chio enters Yicheng’s young teacher psychological literacy training",
      summary: "Chio Chio explored how AI companionship can support education and teacher well-being.",
      body: [
        "At a psychological literacy training session for newly appointed young teachers in Yicheng, Super YouAI co-founder and psychology expert Dr. Guo Kaiyan gave a lecture on mental-health adjustment for teachers in the AI era.",
        "Dr. Guo introduced Chio Chio and demonstrated how AI tools can be used in teaching and emotional-support scenarios.",
        "The training, hosted by the Yicheng Education Bureau, served 100 young teachers and explored how AI may help educators respond to stress, communicate with students, and build healthier classroom relationships."
      ]
    },
    "8790612": {
      title: "Super YouAI named a 2025 AI Changemaker to Watch",
      summary: "Super YouAI received industry attention for its exploration of AI emotional companionship.",
      body: [
        "At the 2025 DEMO CHINA conference hosted by CYZone, Super YouAI was named a “2025 AI Changemaker to Watch.”",
        "The recognition highlights Super YouAI’s work in AI emotional companionship and its attempt to translate psychological care into approachable, everyday product experiences.",
        "For the team, the honor is also a reminder to continue grounding technology in real user needs and long-term social value."
      ]
    },
    "8790611": {
      title: "Super YouAI reaches strategic partnership with DeepTackle",
      summary: "The two companies will explore AI + psychology applications together.",
      body: [
        "Super YouAI and Hubei DeepTackle Technology Development Co., Ltd. signed a business cooperation agreement and strategic framework agreement.",
        "Both sides will combine their resources to focus on interdisciplinary AI + psychology applications, exploring the innovation and boundaries of intelligent emotional-companionship technology.",
        "The collaboration will begin with Chio Chio, continuing through technology optimization, product refinement, and applied research."
      ]
    },
    "8790610": {
      title: "Chio Chio becomes an official recommended project of AI Agent 2025",
      summary: "Chio Chio was selected for its core value and potential industry impact.",
      body: [
        "On October 7, the AI Agent 2025 Global Special Competition announced its first group of 34 official recommended projects. Chio Chio was selected for its core value and disruptive potential.",
        "Earlier, the Chio Chio team had joined the competition as part of the Navigator Program and became the host project of the Mind Repairer track.",
        "The recommendation reflects the competition’s recognition of AI emotional companionship as an important application direction for agent technologies."
      ]
    },
    "8715309": {
      title: "Chio Chio healing AI robot debuts at IOTE Shenzhen, drawing online and offline attention",
      summary: "At IOTE Shenzhen, Chio Chio showed a new form of AIoT psychological companionship.",
      body: [
        "On August 27, IOTE 2025 opened at the Shenzhen World Exhibition & Convention Center. Chio Chio, developed by Super YouAI, made its first public appearance as a healing AI robot.",
        "Its plush appearance, touch interaction, and warm voice attracted many visitors. Some deliberately tested its healing ability by saying they were in a bad mood, and Chio Chio responded with empathy and encouragement.",
        "The team introduced the exhibition version as a preview before official release, with another round of user testing and optimization planned before final market launch.",
        "The response from visitors gave the team confidence that a soft, approachable AI companion can meet real emotional-support needs."
      ]
    },
    "8696210": {
      title: "Chio Chio team invited to the AI Agent 2025 Global Special Competition launch",
      summary: "The team joined the competition launch and received a participation certificate.",
      body: [
        "On August 16, the AI Agent 2025 Global Special Competition launch ceremony was held at the Hong Kong University of Science and Technology (Guangzhou).",
        "The Chio Chio team was invited to attend and received a commemorative certificate as a participating team.",
        "The competition brings together top AI teams from around the world, and Chio Chio will compete as part of the Navigator Program."
      ]
    },
    "8696207": {
      title: "Founder Dr. Yuan Xiaoshuai visits Tsinghua University Future Laboratory",
      summary: "Super YouAI continued exchanges with frontier research institutions around AI, mental health, and embodied interaction.",
      body: [
        "On August 12, Super YouAI founder Dr. Yuan Xiaoshuai visited Tsinghua University Future Laboratory.",
        "During the visit, Dr. Yuan discussed touch sensing, embodied intelligence, mental health, elderly companionship, social interaction, and future materials with researchers.",
        "The visit continued an ongoing relationship between the Super YouAI team and Tsinghua Future Laboratory in technology transfer and research exploration."
      ]
    },
    "8696205": {
      title: "Chio Chio team wins first place at Wensan × Light Cone AI TED startup roadshow",
      summary: "The roadshow provided strong validation for Chio Chio’s product and demand.",
      body: [
        "On May 4, at the Wensan × Light Cone AI TED open roadshow hosted by the Hangzhou West Lake Science and Technology Bureau, the Chio Chio team won the Most Popular Award with the highest audience score.",
        "Founder Dr. Yuan Xiaoshuai presented the team’s original intention, product functions, business model, and healing AI robot concept in a seven-minute pitch.",
        "The result provided valuable validation for the product’s appeal and demand, laying a strong foundation for further development."
      ]
    },
    "8696204": {
      title: "Super YouAI officially settles in Hangzhou Future Sci-Tech City",
      summary: "The company began a new stage for AI emotional-companionship product development.",
      body: [
        "After winning attention during a Hangzhou startup competition, Super YouAI signed an incubation agreement with EGG China and officially established its headquarters in Hangzhou Future Sci-Tech City.",
        "The team chose China because of its strong AI and robotics ecosystem, complete supply chain, open application scenarios, and rich talent network.",
        "For Super YouAI, Hangzhou Future Sci-Tech City offers a supportive environment for moving from research and development to mass production and market expansion."
      ]
    },
    "8696203": {
      title: "Super YouAI invited to an Agentic AI seminar co-hosted by AWS and EGG China",
      summary: "Founder Dr. Yuan shared thoughts on AI companionship, mental health, and the Chinese market.",
      body: [
        "On August 7, Super YouAI founder Dr. Yuan Xiaoshuai was invited to a founder salon co-hosted by Amazon Web Services and EGG China.",
        "The event focused on how agentic AI is opening a new paradigm from dialogue to execution. Dr. Yuan joined a roundtable discussion with experts and AI entrepreneurs.",
        "He explained that emotional healing is deeply related to culture, and that Chinese users often need solutions more attuned to family, workplace, and social relationships.",
        "Super YouAI’s approach is to translate professional psychological tools into accessible companionship that balances expertise with user experience."
      ]
    }
  };

  const originalText = new WeakMap();
  const originalAttr = new WeakMap();

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function normalizePunctuation(value) {
    return normalize(value)
      .replace(/[：]/g, ":")
      .replace(/[，、]/g, ",")
      .replace(/[！]/g, "!")
      .replace(/[？]/g, "?")
      .replace(/[；]/g, ";")
      .replace(/[｜]/g, "|")
      .replace(/[（]/g, "(")
      .replace(/[）]/g, ")")
      .replace(/\s*([:,.!?;|])\s*/g, "$1");
  }

  function staticText(lang) {
    return {
      en: TEXT_EN,
      ja: TEXT_JA,
      da: TEXT_DA
    }[lang] || {};
  }

  function dynamicText(lang) {
    return window[`NEWS_TEXT_${lang.toUpperCase()}`] || {};
  }

  function dynamicArticle(lang) {
    if (lang === "en") return window.NEWS_ARTICLE_EN || {};
    return window[`NEWS_ARTICLE_${lang.toUpperCase()}`] || {};
  }

  function translationKeys(value) {
    const raw = normalize(value);
    const punctuated = normalizePunctuation(raw);
    return [...new Set([raw, punctuated])];
  }

  function lookupTranslation(value, lang) {
    const dictionaries = [staticText(lang), dynamicText(lang)];
    for (const key of translationKeys(value)) {
      for (const dictionary of dictionaries) {
        if (dictionary[key]) return dictionary[key];
      }
    }
    return "";
  }

  function getArticleId() {
    const match = location.pathname.match(/\/(?:newsinfo|news)\/(\d+)\.html$/);
    return match ? match[1] : null;
  }

  function translateTextNode(node, lang) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    if (lang === "zh") {
      node.nodeValue = original;
      return;
    }
    const translated = lookupTranslation(original, lang);
    if (translated) {
      const leading = original.match(/^\s*/)?.[0] || "";
      const trailing = original.match(/\s*$/)?.[0] || "";
      node.nodeValue = leading + translated + trailing;
    }
  }

  function translateAttributes(root, lang) {
    root.querySelectorAll("[alt], [aria-label], [title]").forEach((el) => {
      ["alt", "aria-label", "title"].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const key = `${attr}:${el.getAttribute(attr)}`;
        if (!originalAttr.has(el)) originalAttr.set(el, {});
        const saved = originalAttr.get(el);
        if (!saved[attr]) saved[attr] = el.getAttribute(attr);
        if (lang === "zh") {
          el.setAttribute(attr, saved[attr]);
          return;
        }
        const translated = lookupTranslation(saved[attr], lang);
        if (translated) el.setAttribute(attr, translated);
      });
    });
  }

  function walkAndTranslate(lang) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".language-toggle")) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => translateTextNode(node, lang));
    translateAttributes(document.body, lang);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function translateCloneText(node, lang) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(textNode) {
        const parent = textNode.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return normalize(textNode.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((textNode) => {
      const original = textNode.nodeValue;
      const translated = lookupTranslation(original, lang);
      if (translated) {
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";
        textNode.nodeValue = leading + translated + trailing;
      } else if (/[\u4e00-\u9fff]/.test(original)) {
        textNode.nodeValue = "";
      }
    });
    translateAttributes(node, lang);
  }

  function renderTranslatedArticleBlocks(html, lang) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    const blocks = [];
    holder.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = normalize(child.nodeValue || "");
        const translated = lookupTranslation(text, lang);
        if (translated) blocks.push(`<p class="article-en-paragraph">${escapeHTML(translated)}</p>`);
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const clone = child.cloneNode(true);
      translateCloneText(clone, lang);
      const text = normalize(clone.textContent || "");
      const hasMedia = clone.querySelector("img, video, iframe");
      if (text || hasMedia) blocks.push(clone.outerHTML);
    });
    return blocks.join("");
  }

  function renderTranslatedArticleBody(body, data, lang) {
    if (!body || !data || !Array.isArray(data.body) || !data.body.length) return;
    if (!body.dataset.zhHtml) body.dataset.zhHtml = body.innerHTML;
    const manualBodyLength = data.body.join(" ").length;
    const hasDetailedManualBody = data.body.length >= 6 || manualBodyLength > 1200;
    if (hasDetailedManualBody) {
      const media = renderTranslatedArticleBlocks(body.dataset.zhHtml, lang).match(/<figure[\s\S]*?<\/figure>/g) || [];
      let nextMediaIndex = 0;
      const hasMediaTokens = data.body.some((text) => /^\[\[media:(next|\d+)\]\]$/i.test(String(text || "").trim()));
      const paragraphs = data.body.map((text) => {
        const trimmed = String(text || "").trim();
        if (!trimmed) return "";
        const mediaToken = trimmed.match(/^\[\[media:(next|\d+)\]\]$/i);
        if (mediaToken) {
          if (mediaToken[1].toLowerCase() === "next") return media[nextMediaIndex++] || "";
          const mediaIndex = Number(mediaToken[1]) - 1;
          nextMediaIndex = Math.max(nextMediaIndex, mediaIndex + 1);
          return media[mediaIndex] || "";
        }
        const qaLine = /^(A|Q)\s*[:：]/i.test(trimmed);
        return `<p class="${qaLine ? "qa-line " : ""}article-en-paragraph">${escapeHTML(trimmed)}</p>`;
      }).join("");
      body.innerHTML = `<div class="article-translated-body">${paragraphs}${hasMediaTokens ? "" : media.join("")}</div>`;
      return;
    }
    const translatedBlocks = renderTranslatedArticleBlocks(body.dataset.zhHtml, lang);
    if (translatedBlocks && translatedBlocks.length > 120) {
      body.innerHTML = `<div class="article-translated-body">${translatedBlocks}</div>`;
      return;
    }
    const paragraphs = data.body.map((text) => {
      const trimmed = String(text || "").trim();
      if (!trimmed) return "";
      const qaLine = /^(A|Q)\s*[:：]/i.test(trimmed);
      return `<p class="${qaLine ? "qa-line " : ""}article-en-paragraph">${escapeHTML(trimmed)}</p>`;
    }).join("");
    body.innerHTML = `<div class="article-translated-body">${paragraphs}</div>`;
  }

  function applyArticle(lang) {
    const id = getArticleId();
    const data = id ? (dynamicArticle(lang)[id] || (lang === "en" ? ARTICLE_EN[id] : null)) : null;
    if (!id || !data) return;
    const body = document.querySelector(".article-body");
    if (body && !body.dataset.zhHtml) body.dataset.zhHtml = body.innerHTML;
    const title = document.querySelector(".article-header h1");
    const lead = document.querySelector(".article-header p");
    const crumb = document.querySelector(".breadcrumb span:last-child");
    const heroImg = document.querySelector(".article-hero-image img");
    [title, lead, crumb].forEach((el) => {
      if (el && !el.dataset.zhText) el.dataset.zhText = el.textContent;
    });
    if (heroImg && !heroImg.dataset.zhAlt) heroImg.dataset.zhAlt = heroImg.alt;
    if (!document.documentElement.dataset.zhTitle) document.documentElement.dataset.zhTitle = document.title;

    if (lang !== "zh" && data) {
      if (title) title.textContent = data.title;
      if (lead) lead.textContent = data.summary;
      if (crumb) crumb.textContent = data.title;
      if (heroImg) heroImg.alt = data.title;
      renderTranslatedArticleBody(body, data, lang);
      const newsLabel = lang === "ja" ? "ブランドニュース" : lang === "da" ? "Nyheder" : "News";
      document.title = `${data.title} | ${newsLabel} | Chio Chio`;
    } else {
      if (title?.dataset.zhText) title.textContent = title.dataset.zhText;
      if (lead?.dataset.zhText) lead.textContent = lead.dataset.zhText;
      if (crumb?.dataset.zhText) crumb.textContent = crumb.dataset.zhText;
      if (heroImg?.dataset.zhAlt) heroImg.alt = heroImg.dataset.zhAlt;
      if (body?.dataset.zhHtml) body.innerHTML = body.dataset.zhHtml;
      if (document.documentElement.dataset.zhTitle) document.title = document.documentElement.dataset.zhTitle;
    }
  }

  function translateArticleNav(lang) {
    document.querySelectorAll(".article-nav strong").forEach((el) => {
      if (!el.dataset.zhText) el.dataset.zhText = el.textContent;
      if (lang === "zh") {
        el.textContent = el.dataset.zhText;
        return;
      }
      const translated = lookupTranslation(el.dataset.zhText, lang);
      if (translated) el.textContent = translated;
    });
  }

  function translateDocumentTitle(lang) {
    if (getArticleId()) return;
    if (!document.documentElement.dataset.zhTitle) {
      document.documentElement.dataset.zhTitle = document.title;
    }
    const original = document.documentElement.dataset.zhTitle;
    document.title = lang === "zh" ? original : (lookupTranslation(original, lang) || original);
  }

  function setLanguage(lang) {
    const next = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
    document.documentElement.lang = next === "zh" ? "zh-CN" : next;
    document.body.classList.add("is-language-switching");
    applyArticle(next);
    translateDocumentTitle(next);
    translateArticleNav(next);
    walkAndTranslate(next);
    translateArticleNav(next);
    updateToggle(next);
    localStorage.setItem(STORAGE_KEY, next);
    setTimeout(() => document.body.classList.remove("is-language-switching"), 260);
  }

  function updateToggle(lang) {
    document.querySelectorAll("[data-language-option]").forEach((button) => {
      const active = button.dataset.languageOption === lang;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = lang;
    });
  }

  function createLanguageToggle() {
    const toggle = document.createElement("div");
    toggle.className = "language-toggle";
    toggle.setAttribute("aria-label", "选择语言 / Select language");
    toggle.innerHTML = `
      <span class="language-toggle-label" aria-hidden="true">文</span>
      <select data-language-select aria-label="选择语言 / Select language">
        <option value="zh">中文</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="da">Dansk</option>
      </select>
    `;
    toggle.addEventListener("change", (event) => {
      const select = event.target.closest("[data-language-select]");
      if (select) setLanguage(select.value);
    });
    const header = document.querySelector(".site-header");
    if (header) {
      const app = header.querySelector(".app-download");
      header.insertBefore(toggle, app || null);
    } else {
      toggle.classList.add("article-language-toggle");
      document.body.appendChild(toggle);
    }
  }

  function createMobileNavigation() {
    const header = document.querySelector(".site-header");
    const nav = header?.querySelector(".nav");
    if (!header || !nav || header.querySelector(".mobile-nav-toggle")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-nav-toggle";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "打开菜单");
    button.innerHTML = "<span></span><span></span><span></span>";

    const drawer = document.createElement("nav");
    drawer.className = "mobile-nav-drawer";
    drawer.setAttribute("aria-label", "手机导航");
    drawer.innerHTML = nav.innerHTML;

    const close = () => {
      button.setAttribute("aria-expanded", "false");
      drawer.classList.remove("is-open");
      document.body.classList.remove("mobile-nav-open");
    };
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("mobile-nav-open", open);
    });
    drawer.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    header.appendChild(button);
    header.insertAdjacentElement("afterend", drawer);
  }

  function initMotion() {
    const revealSelector = [
      ".hero-copy",
      ".hero-product",
      ".home-content-panel",
      ".home-product-visual",
      ".feature-copy",
      ".page-hero > *",
      ".section-head",
      ".card",
      ".panel",
      ".persona",
      ".partner-card",
      ".partner-value-card",
      ".invite-card",
      ".news-card",
      ".news-row",
      ".news-featured",
      ".product-form-card",
      ".usecase-card",
      ".system-panel",
      ".gallery-grid figure"
    ].join(",");

    const items = [...document.querySelectorAll(revealSelector)];
    if (document.body.classList.contains("article-page")) {
      document.querySelectorAll(".article-layout, .article-nav, .article-back").forEach((el) => {
        el.classList.add("is-visible");
      });
    }
    items.forEach((el, index) => {
      el.classList.add("motion-reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 45}ms`);
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      items.forEach((el) => observer.observe(el));
      window.setTimeout(() => {
        items.forEach((el) => {
          if (!el.classList.contains("is-visible")) el.classList.add("is-visible");
        });
      }, 700);
    } else {
      items.forEach((el) => el.classList.add("is-visible"));
    }

    document.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("a, button, .card, .persona, .partner-card, .news-card, .news-row, .product-form-card, .usecase-card, .invite-card");
      if (!target) return;
      target.classList.add("is-pressing");
      window.setTimeout(() => target.classList.remove("is-pressing"), 180);
    }, { passive: true });
  }

  function getCopyPayload(link) {
    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) {
      return {
        value: href.replace(/^mailto:/, "").split("?")[0],
        zhTitle: "邮箱已复制",
        enTitle: "Email copied"
      };
    }
    if (href.startsWith("tel:")) {
      return {
        value: href.replace(/^tel:/, ""),
        zhTitle: "手机号已复制",
        enTitle: "Phone number copied"
      };
    }
    return null;
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  function copyUi(lang) {
    return {
      zh: { hint: "点击复制", title: "已复制", copied: "已复制，可以直接粘贴联系。" },
      en: { hint: "Click to copy", title: "Copied", copied: "is copied and ready to paste." },
      ja: { hint: "クリックしてコピー", title: "コピーしました", copied: "をコピーしました。そのまま貼り付けられます。" },
      da: { hint: "Klik for at kopiere", title: "Kopieret", copied: "er kopieret og klar til at blive indsat." }
    }[lang] || { hint: "点击复制", title: "已复制", copied: "已复制，可以直接粘贴联系。" };
  }

  function showCopyToast(payload) {
    let toast = document.querySelector(".copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML = "<strong></strong><span></span>";
      document.body.appendChild(toast);
    }
    const lang = document.documentElement.lang.replace("zh-CN", "zh");
    const ui = copyUi(lang);
    toast.querySelector("strong").textContent = lang === "zh" ? payload.zhTitle : lang === "en" ? payload.enTitle : ui.title;
    toast.querySelector("span").textContent = `${payload.value} ${ui.copied}`;
    toast.classList.add("is-visible");
    window.clearTimeout(showCopyToast.timer);
    showCopyToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function initContactCopy() {
    document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
      const payload = getCopyPayload(link);
      if (!payload) return;
      link.setAttribute("title", "点击复制");
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
          await copyText(payload.value);
          showCopyToast(payload);
        } catch (error) {
          window.location.href = link.href;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    createLanguageToggle();
    createMobileNavigation();
    initMotion();
    initContactCopy();
    setLanguage(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG);
  });
})();
