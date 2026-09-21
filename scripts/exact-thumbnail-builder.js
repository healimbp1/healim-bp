const fs = require('fs');
const path = require('path');

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\([\u4e00-\u9fa5\s·]+\)/g, '')
    .trim();
}

// 37개 전 칼럼 1:1 완벽 맞춤형 썸네일 데이터베이스 (중복/오기 0%)
const columnThumbnailDB = {
  'piriformis-syndrome-buttock-sciatica': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "오래 앉아 있을 때 엉치가 찌릿하고 다리로 내려가는 저림",
    "title": "이상근증후군 · 좌골신경통 한방 치료",
    "subTitle": "엉덩이 속 굳어버린 이상근을 풀고 신경 압박을 해소하는 골반 추나 & 약침",
    "step1": {
        "title": "이상근 단축 & 좌골신경 포착 정밀 진단",
        "desc": "허리디스크 방사통과의 정밀 감별 및 골반 회전 변위 체크"
    },
    "step2": {
        "title": "심부 둔근 이완 전침 & 정밀 소염약침",
        "desc": "두꺼워진 이상근을 직접 이완하여 짓눌린 좌골신경 해방"
    },
    "step3": {
        "title": "골반-천골 교정 추나 & 둔근 스트레칭",
        "desc": "틀어진 장골·천골 균형 정렬로 엉치 압박 재발 차단"
    }
},
  'menopausal-hot-flashes-insomnia-herbal-care': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "시도 때도 없이 얼굴로 훅 달아오르는 열감과 식은땀",
    "title": "여성 갱년기 · 상열감 · 불면증 한방 치료",
    "subTitle": "부족해진 진액을 채우고 허열(虛熱)을 내리는 자음강화 맞춤 보약",
    "step1": {
        "title": "음허화동(陰虛火動) & 자율신경 실조 정밀 진단",
        "desc": "호르몬 변화에 따른 상열감·식은땀·가슴 두근거림 평가"
    },
    "step2": {
        "title": "체질 맞춤 자음강화탕 & 가미소요산",
        "desc": "신수(腎水)를 보충하고 위로 치솟는 허열을 부드럽게 진정"
    },
    "step3": {
        "title": "청심 안신 약침 & 온열 뜸 치료",
        "desc": "과열된 교감신경을 안정시켜 깊은 숙면과 감정 기복 해소"
    }
},
  'trigger-finger-stenosing-tenosynovitis': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "손가락이 굽혀진 채 총의 방아쇠처럼 \"딸깍\" 걸리는 통증",
    "title": "방아쇠수지 · 손가락 건초염 한방 치료",
    "subTitle": "두꺼워진 A1 도르래와 힘줄 유착을 비수술로 정밀 박리하는 전침 & 약침",
    "step1": {
        "title": "A1 활차(도르래) 비후 & 힘줄 결절 정밀 진단",
        "desc": "손바닥 압통점 결절 및 손가락 신전 잠김 현상 체크"
    },
    "step2": {
        "title": "도르래 미세 감압 심부 전침 & 소염약침",
        "desc": "절개 수술 없이 두꺼워진 건막 섬유띠를 부드럽게 이완"
    },
    "step3": {
        "title": "수근간 관절 정렬 교정 & 건막 온열 치료",
        "desc": "손가락 굴곡건 활주 경로를 넓혀 부드러운 굽힘 복원"
    }
},
  'traffic-accident-lumbar-disc-sciatica': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "접촉사고 충격으로 굳어버린 허리와 찌릿한 골반 통증",
    "title": "교통사고 요추 염좌 · 골반 충격 한방 치료",
    "subTitle": "척추 충격을 감압하고 어혈을 풀어주는 자동차보험 1:1 맞춤 통원 케어",
    "step1": {
        "title": "편타성 요추 손상 & 골반 비틀림 정밀 진단",
        "desc": "추돌 시 충격으로 인한 척추 기립근 및 요방형근 손상 체크"
    },
    "step2": {
        "title": "어혈 배출 첩약 & 척추 감압 추나요법",
        "desc": "미세 혈종을 녹여내고 좁아진 요추 관절 간격을 안전하게 확보"
    },
    "step3": {
        "title": "신경근 소염약침 & 한방 물리치료",
        "desc": "본인부담금 0원으로 통증 완화부터 후유증 예방까지 집중 치료"
    }
},
  'chronic-laryngitis-hoarseness-bopyego': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "조금만 말해도 목이 갈라지고 쉰 목소리가 지속될 때",
    "title": "만성 후두염 · 쉰 목소리 · 보폐고 한방 치료",
    "subTitle": "건조해진 성대 점막에 진액을 채우고 염증을 가라앉히는 수제 보폐고",
    "step1": {
        "title": "성대 점막 건조 & 후두 염증도 정밀 진단",
        "desc": "음성 피로도 및 후두 점막 발적·부종 상태 종합 평가"
    },
    "step2": {
        "title": "전통 옹기 고농축 수제 보폐고(補肺膏)",
        "desc": "성대 표면 점액층을 복원하여 마찰 손상 방지 및 소염"
    },
    "step3": {
        "title": "청인 약침 & 발성 호흡 교정 티칭",
        "desc": "인후부 미세 순환을 촉진하여 맑고 청아한 목소리 회복"
    }
},
  'burnout-syndrome-brain-fatigue-gongjindan': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "쉬어도 멍하고 집중력이 바닥난 현대인의 \"뇌 과부하\"",
    "title": "번아웃 증후군 · 뇌 피로 · 사향공진단",
    "subTitle": "중추신경 피로를 씻어내고 뇌 혈류를 깨우는 식약처 인증 정품 사향공진단",
    "step1": {
        "title": "중추 뇌 피로 & 심신 소갈(消渴) 정밀 진단",
        "desc": "자율신경 밸런스 및 만성 스트레스 코르티솔 고갈 평가"
    },
    "step2": {
        "title": "정품 인증 CITES 사향 함유 원방 공진단",
        "desc": "개규(開竅) 작용으로 뇌세포에 산소와 영양을 즉각 공급"
    },
    "step3": {
        "title": "청뇌 안신 약침 & 두경부 림프 순환 추나",
        "desc": "상초의 열을 내리고 전신 기혈 순환을 복원하여 활력 충전"
    }
},
  'hallux-valgus-foot-pain-chuna': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "엄지발가락이 휘어지고 튀어나와 신발 신을 때마다 욱신거릴 때",
    "title": "무지외반증 · 엄지발가락 관절염 한방 치료",
    "subTitle": "무너진 족궁을 세우고 중족골 정렬을 맞추는 족부 추나 & 소염약침",
    "step1": {
        "title": "무지외반 변형 각도 & 종·횡족궁 무너짐 진단",
        "desc": "1~4단계 외반 각도 측정 및 보행 시 족저 압력 불균형 체크"
    },
    "step2": {
        "title": "제1 중족지관절 소염약침 & 관절 가동 추나",
        "desc": "돌출된 건막류(Bunion)의 마찰 염증을 가라앉히고 뼈 정렬 교정"
    },
    "step3": {
        "title": "후경골근 강화 전침 & 맞춤 족부 테이핑",
        "desc": "발바닥 아치를 받쳐주어 보행 시 통증 재발 차단"
    }
},
  'traffic-accident-wrist-ankle-impact-sprain': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "핸들 충격으로 꺾인 손목과 페달 충격으로 삔 발목",
    "title": "교통사고 손목 · 발목 관절 염좌 한방 치료",
    "subTitle": "미세 관절 아탈구를 맞추고 어혈을 풀어주는 자동차보험 1:1 집중 케어",
    "step1": {
        "title": "수근관·족관절 인대 손상 & 관절 유격 정밀 진단",
        "desc": "충돌 시 반작용으로 인한 손목 TFCC 및 발목 인대 손상 체크"
    },
    "step2": {
        "title": "어혈 제거 첩약 & 인대강화 약침 치료",
        "desc": "관절 속 미세 출혈과 부종을 배출하고 늘어난 인대 재생"
    },
    "step3": {
        "title": "사지 관절 교정 추나 & 치료적 테이핑",
        "desc": "본인부담금 0원으로 손목·발목 안정성 완벽 복원"
    }
},
  'dry-cough-airconditioner-heater-bopyego': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "건조한 공기나 찬바람만 쐬면 발작적으로 터지는 마른기침",
    "title": "만성 마른기침 · 기관지 점막 건조 · 보폐고 치료",
    "subTitle": "가래 없이 목만 간질간질한 폐음허 기침을 다스리는 수제 보폐고",
    "step1": {
        "title": "폐음허(肺陰虛) & 기관지 과민성 정밀 진단",
        "desc": "감기약·기침약으로 안 멎는 기관지 점막 탈수 상태 분석"
    },
    "step2": {
        "title": "전통 옹기 고농축 수제 보폐고(補肺膏)",
        "desc": "기관지 섬모에 진액을 채워 미세 자극 방어벽 형성"
    },
    "step3": {
        "title": "청폐 윤조 약침 & 폐경락 침구 치료",
        "desc": "호흡기 면역력을 높여 계절 변화에도 편안한 숨결 완성"
    }
},
  'male-menopause-stamina-vitality-tonic': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "자고 일어나도 천근만근 무겁고 자신감이 떨어질 때",
    "title": "남성 갱년기 · 만성 무기력 · 원기 보약",
    "subTitle": "고갈된 신정(腎精)을 채우고 남성 활력을 깨우는 맞춤 보정탕 & 공진단",
    "step1": {
        "title": "신양허(腎陽虛) & 남성 호르몬 저하 정밀 진단",
        "desc": "아침 피로도·근력 저하·의욕 감퇴·면역력 종합 평가"
    },
    "step2": {
        "title": "체질 맞춤 보정탕 & 녹용 사향공진단",
        "desc": "하초의 양기를 북돋우고 혈액순환과 테스토스테론 활성화"
    },
    "step3": {
        "title": "원기 회복 약침 & 온양 뜸 치료",
        "desc": "기초 대사량을 올리고 전신 활력과 자신감 완벽 복원"
    }
},
  'thoracic-outlet-syndrome-arm-numbness': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "팔을 들어 올리거나 잘 때 손가락 전체가 저리고 시린 통증",
    "title": "흉곽출구증후군 · 팔저림 한방 치료",
    "subTitle": "쇄골 아래 짓눌린 상완신경총과 쇄골하혈관을 해방하는 경추 추나 & 약침",
    "step1": {
        "title": "상완신경총 압박 부위 & 사각근 단축 정밀 진단",
        "desc": "에디슨(Adson)·루스(Roos) 테스트 및 목디스크 방사통 감별"
    },
    "step2": {
        "title": "전사각근·소흉근 심부 전침 & 소염약침",
        "desc": "두꺼워진 근막을 정밀 이완하여 짓눌린 신경·혈관 통로 개방"
    },
    "step3": {
        "title": "경추-흉곽 가동 추나 & 둥근 어깨 교정",
        "desc": "말린 어깨(라운드숄더)를 펴고 쇄골 관절 공간 영구 확보"
    }
},
  'traffic-accident-tinnitus-dizziness-syndrome': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "접촉사고 충격 후 귀에서 삐 소리 나고 핑 도는 어지러움",
    "title": "교통사고 이명 · 어지럼증 · 두통 한방 치료",
    "subTitle": "상부 경추 충격을 교정하고 뇌 혈류를 안정시키는 자동차보험 1:1 맞춤 케어",
    "step1": {
        "title": "경추성 자율신경 실조 & 뇌혈류 장애 정밀 진단",
        "desc": "이비인후과 검사상 정상인 편타성 경추 기인 이명·어지럼증 감별"
    },
    "step2": {
        "title": "어혈 청뇌 안신 한약 & 두경부 추나요법",
        "desc": "미세 혈종을 제거하고 뇌척수액 순환과 뇌 혈류 개선"
    },
    "step3": {
        "title": "후두하근 정밀 약침 & 전침 신경 안정 치료",
        "desc": "본인부담금 0원으로 메스꺼움·불안·두통까지 복합 치유"
    }
},
  'reflux-laryngitis-throat-clearing-bopyego': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "위산 역류로 목이 화끈거리고 가래 낀 듯 답답한 헛기침",
    "title": "역류성 후두염 · 목 이물감 · 담적병 한방 치료",
    "subTitle": "위장 내 독소 담적(痰積)을 삭히고 손상된 성대 점막을 재생하는 보폐고",
    "step1": {
        "title": "하부식도괄약근 이완 & 인후두 점막 산 손상 진단",
        "desc": "명치 답답함·잦은 트림·목 이물감·신물 역류 종합 평가"
    },
    "step2": {
        "title": "위장 담적 제거 한약 & 수제 보폐고(補肺膏)",
        "desc": "위장 연동 운동을 정상화하고 산으로 헐어버린 인후 점막 소염"
    },
    "step3": {
        "title": "복부 온열 뜸 & 인후부 정밀 약침 치료",
        "desc": "역류 경로를 차단하고 맑은 호흡과 편안한 목 상태 복원"
    }
},
  'post-surgery-chemo-recovery-immune-tonic': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "대수술이나 항암 치료 후 바닥난 체력과 떨어진 면역력",
    "title": "수술 후 기력 회복 · 면역 보약 한방 치료",
    "subTitle": "오장육부의 정기를 채우고 혈액 생성을 돕는 십전대보탕 & 원방경옥고",
    "step1": {
        "title": "기혈양허(氣血兩虛) & 위장 흡수력 정밀 진단",
        "desc": "수술 후 혈색 불량·식욕 부진·만성 탈진·상처 회복도 평가"
    },
    "step2": {
        "title": "소화 편한 맞춤 회복 한약 & 전통 경옥고",
        "desc": "위장에 부담 없이 부드럽게 흡수되어 적혈구·백혈구 생성 촉진"
    },
    "step3": {
        "title": "면역 강화 약침 & 온열 순환 뜸 치료",
        "desc": "체온을 올리고 자연 치유력을 극대화하여 건강한 일상 복귀"
    }
},
  'pes-anserine-bursitis-knee-pain': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "계단 내려갈 때 무릎 안쪽 5cm 아래가 찌릿하게 아플 때",
    "title": "거위발건염 · 무릎 활액낭염 한방 치료",
    "subTitle": "무릎 안쪽 세 힘줄의 마찰 염증을 가라앉히는 소염약침 & 관절 추나",
    "step1": {
        "title": "거위발건(봉공근·박근·반건양근) 활액낭염 진단",
        "desc": "퇴행성 무릎 관절염·내측 반월상연골 파열과의 감별 검진"
    },
    "step2": {
        "title": "정밀 소염약침 & 심부 전침 요법",
        "desc": "붓고 열나는 활액낭 염증을 가라앉히고 힘줄 유착 박리"
    },
    "step3": {
        "title": "경골-대퇴골 관절 가동 추나 & 햄스트링 이완",
        "desc": "O자형 휜 다리 하중을 분산시켜 무릎 안쪽 압박 해소"
    }
},
  'traffic-accident-pediatric-night-terrors': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "접촉사고 후 자다가 소리지르며 울고 보채는 우리 아이",
    "title": "소아 교통사고 후유증 · 야경증 · 안신 한약",
    "subTitle": "놀란 심신을 진정시키고 미세 충격을 치료하는 자동차보험 1:1 맞춤 케어",
    "step1": {
        "title": "소아 편타 손상 & 심신 불안(驚風) 정밀 진단",
        "desc": "표현이 서툰 아이의 야제증·식욕 부진·짜증·근육 긴장 평가"
    },
    "step2": {
        "title": "맛있고 순한 무설탕 어린이 안신 첩약",
        "desc": "놀란 심장을 진정시키고 소화기를 편안하게 다스림"
    },
    "step3": {
        "title": "아프지 않은 소아 자석침 & 온열 뜸 치료",
        "desc": "본인부담금 0원으로 아이의 숙면과 정서적 안정 완성"
    }
},
  'pediatric-sinusitis-rhinitis-drainage': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "코가 꽉 막혀 입으로 숨쉬고 코골며 자는 아이",
    "title": "소아 비염 · 축농증 · 한방 배농 요법",
    "subTitle": "자극 없이 농을 배출하고 비강 점막 면역을 키우는 안심 한방 호흡기 치료",
    "step1": {
        "title": "비강 점막 종창 & 아데노이드 비대 정밀 진단",
        "desc": "구강 호흡에 따른 구강 구조 변형 및 수면 무호흡 체크"
    },
    "step2": {
        "title": "순한 생약 비강 배농 청비 요법 & 보폐고",
        "desc": "정체된 콧물을 시원하게 배출하고 코 점막 상피세포 보습"
    },
    "step3": {
        "title": "소아 면역 비염 한약 & 림프 순환 케어",
        "desc": "항생제 내성 걱정 없이 스스로 이겨내는 코 면역력 완성"
    }
},
  'pediatric-growth-immunity-herbal-tonic': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "또래보다 키가 작고 밥을 안 먹어 걱정인 우리 아이",
    "title": "소아 성장 발달 · 식욕 부진 · 맞춤 성장 한약",
    "subTitle": "소화 흡수력을 높이고 성장판에 영양을 공급하는 녹용 분골 성장 보약",
    "step1": {
        "title": "성장 잠재력 & 비위(脾胃) 허약 체질 정밀 진단",
        "desc": "골연령·체성분·식습관·수면 패턴·소화기 흡수율 종합 평가"
    },
    "step2": {
        "title": "비위 강화 소아 첩약 & 최고급 녹용 분골",
        "desc": "입맛을 돋우고 뼈와 근육의 성장을 자극하는 맞춤 처방"
    },
    "step3": {
        "title": "성장점 자극 침구 & 척추 밸런스 성장 추나",
        "desc": "바른 자세와 깊은 숙면을 유도하여 키 성장 골든타임 완성"
    }
},
  'achilles-tendinitis-heel-pain': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "아침 첫 발 디딜 때 뒤꿈치 위쪽이 뻣뻣하고 찌릿한 통증",
    "title": "아킬레스건염 · 발뒤꿈치 통증 한방 치료",
    "subTitle": "미세 파열된 건 조직을 재생하고 종아리 긴장을 푸는 봉약침 & 족부 추나",
    "step1": {
        "title": "아킬레스건 비후 & 건초 염증 정밀 진단",
        "desc": "뒤꿈치 뼈 부착부 건염 및 비복근·가자미근 단축도 평가"
    },
    "step2": {
        "title": "인대강화 봉약침 & 심부 전침 요법",
        "desc": "혈관이 부족한 건 조직에 혈류를 모아 콜라겐 섬유 증식"
    },
    "step3": {
        "title": "거골 교정 족부 추나 & 힐드롭 운동 티칭",
        "desc": "발목 충격을 완충하여 보행 시 재발 방지"
    }
},
  'traffic-accident-clavicle-chest-contusion': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "안전벨트가 흉곽을 조여 숨 쉴 때마다 결리는 가슴 통증",
    "title": "교통사고 가슴 타박상 · 쇄골 멍 한방 치료",
    "subTitle": "흉부 미세 어혈을 녹여내고 흉곽 근막을 이완하는 자동차보험 1:1 집중 케어",
    "step1": {
        "title": "늑골 미세 골절 감별 & 흉곽 근막 손상 진단",
        "desc": "기침·심호흡·자세 변경 시 찌릿한 흉부 통증 정밀 평가"
    },
    "step2": {
        "title": "어혈 소종 첩약 & 흉곽 이완 약침 치료",
        "desc": "가슴 속 멍과 어혈을 빠르게 배출하고 호흡을 편안하게 개선"
    },
    "step3": {
        "title": "흉추-늑골 가동 추나 & 한방 물리치료",
        "desc": "본인부담금 0원으로 안전벨트 후유증 완벽 해결"
    }
},
  'bronchiectasis-chronic-phlegm-bopyego': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "아침마다 끓어오르는 끈적한 가래와 반복되는 기관지염",
    "title": "기관지확장증 · 만성 가래 · 보폐고 한방 치료",
    "subTitle": "변형된 기관지 점막을 정화하고 배농력을 높이는 수제 보폐고",
    "step1": {
        "title": "기관지 탄력 저하 & 담열(痰熱) 울체 정밀 진단",
        "desc": "누런 가래량·객혈 여부·호흡 곤란도·폐 기능 종합 평가"
    },
    "step2": {
        "title": "전통 옹기 고농축 수제 보폐고(補肺膏)",
        "desc": "기관지 섬모 운동을 촉진하여 정체된 농성 가래 배출"
    },
    "step3": {
        "title": "청폐 화담 한약 & 폐수혈 정밀 약침",
        "desc": "폐포 자생력을 강화하여 잦은 2차 세균 감염 차단"
    }
},
  'elderly-frailty-appetite-deer-antler-tonic': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "걸음걸이가 느려지고 입맛을 잃으신 부모님의 \"노쇠 증후군\"",
    "title": "부모님 기력 쇠약 · 식욕 부진 · 맞춤 녹용보약",
    "subTitle": "소화 부담 없이 뼈와 근육을 튼튼히 하는 최고급 녹용 분골 & 원방경옥고",
    "step1": {
        "title": "간신휴허(肝腎虧虛) & 근감소 노쇠 정밀 진단",
        "desc": "소화력·골다공증 위험도·기립성 저혈압·만성 피로도 평가"
    },
    "step2": {
        "title": "흡수 편한 맞춤 녹용 탕약 & 옹기 중탕 경옥고",
        "desc": "위장에 무리 없이 오장육부의 원기를 채우고 혈류 순환 개선"
    },
    "step3": {
        "title": "원기 회복 약침 & 온열 뜸 치료",
        "desc": "체온을 올리고 면역력을 증강하여 건강한 100세 활력 완성"
    }
},
  'cervical-facet-syndrome-neck-pain': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "고개를 뒤로 젖히거나 돌릴 때 목 뒤 관절이 찌릿하게 걸릴 때",
    "title": "경추 후관절증후군 · 목 결림 한방 치료",
    "subTitle": "끼어있는 후관절 활액막을 풀고 C커브를 회복하는 경추 추나 & 약침",
    "step1": {
        "title": "경추 후관절 잠김(Facet Lock) 정밀 진단",
        "desc": "스펄링(Spurling) 테스트 및 목디스크 신경근 압박과의 감별"
    },
    "step2": {
        "title": "후관절 활액막 소염약침 & 동작침법(MSAT)",
        "desc": "염증을 즉각 가라앉히고 굳은 목 관절의 가동 범위 즉시 복원"
    },
    "step3": {
        "title": "경추 분절 감압 추나 & 베개 체형 교정",
        "desc": "일자목을 바른 C커브로 정렬하여 관절 마모 재발 차단"
    }
},
  'traffic-accident-insurance-treatment-guide': {
    "category": "교통사고 후유증 & 자동차보험 클리닉",
    "subHook": "조기 합의 후 재발하면 내 돈으로 치료? 똑똑한 환자의 선택",
    "title": "교통사고 합의 전 필수 한방 치료 가이드",
    "subTitle": "후유증 없는 완쾌를 위해 자동차보험으로 누리는 체계적 1:1 한방 솔루션",
    "step1": {
        "title": "사고 후 골든타임 3주 집중 케어 진단",
        "desc": "편타 손상·미세 어혈·자율신경 불균형 종합 평가"
    },
    "step2": {
        "title": "본인부담금 0원 100% 자동차보험 보장",
        "desc": "맞춤 한약 첩약·추나요법·정밀 약침·물리치료 전액 적용"
    },
    "step3": {
        "title": "완전 회복 후 안심 합의 원칙",
        "desc": "통증과 가동 범위가 정상화될 때까지 안심하고 통원 치료"
    }
},
  'vocal-polyp-voice-restoration-bopyego': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "목소리가 완전히 갈라지고 성대에 물혹이 생겼을 때",
    "title": "성대폴립 · 성대 부종 · 보폐고 한방 치료",
    "subTitle": "수술 전 성대 점막의 혈종과 부종을 흡수시키는 수제 보폐고",
    "step1": {
        "title": "성대 점막 혈종 & 폴립 크기 정밀 진단",
        "desc": "음성 남용으로 인한 성대 표막 파열 및 물혹 형성도 평가"
    },
    "step2": {
        "title": "전통 옹기 고농축 수제 보폐고(補肺膏)",
        "desc": "성대 점막의 림프 순환을 도와 물혹 흡수 및 소염"
    },
    "step3": {
        "title": "청음 약침 & 발성 이완 침구 치료",
        "desc": "성대 접촉 마찰을 최소화하여 맑고 건강한 음성 복원"
    }
},
  'exam-student-concentration-chongmyeongtang': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "시험을 앞두고 머리가 멍하고 체력이 고갈된 수험생",
    "title": "수험생 총명 공진단 · 뇌 피로 · 집중력 보약",
    "subTitle": "원지·석창포·정품 사향으로 뇌 혈류를 맑게 깨우는 1:1 맞춤 총명탕",
    "step1": {
        "title": "수험생 스트레스 & 뇌 피로도 정밀 진단",
        "desc": "기억력 감퇴·뒷목 결림·수면 장애·소화불량 종합 평가"
    },
    "step2": {
        "title": "동의보감 원방 총명탕 & 사향 총명공진단",
        "desc": "중추신경 피로를 씻어내고 뇌세포 산소 공급 극대화"
    },
    "step3": {
        "title": "두경부 림프 순환 추나 & 청뇌 약침",
        "desc": "상초의 열을 내리고 시험 당일 최상의 컨디션 완성"
    }
},
  'trapezius-myofascial-pain-syndrome': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "어깨에 곰 한 마리가 앉아있는 듯 굳어진 만성 승모근 통증",
    "title": "승모근 결림 · 근막통증증후군 한방 치료",
    "subTitle": "통증유발점(Trigger Point)을 정밀 해소하고 체형을 펴는 추나 & 심부 약침",
    "step1": {
        "title": "상부 승모근 발통점 & 거북목 체형 정밀 진단",
        "desc": "단단한 근경결 밴드 및 긴장성 두통 동반 여부 체크"
    },
    "step2": {
        "title": "심부 근막 이완 전침 & 소염 약침 치료",
        "desc": "굳어버린 근육 매듭을 풀고 젖산과 노폐물 즉각 배출"
    },
    "step3": {
        "title": "경추-흉추 밸런스 추나 & 굽은 어깨 교정",
        "desc": "어깨 하중을 정상화하여 만성 어깨 뭉침 영구 해소"
    }
},
  'spondylolisthesis-lumbar-instability-chuna': {
    "category": "척추·관절 & 추나 클리닉",
    "subHook": "서 있거나 걸을 때 허리가 뚝 끊어질 듯한 척추 불안정증",
    "title": "척추전방전위증 · 요추 불안정증 한방 치료",
    "subTitle": "밀려난 척추뼈의 전방 전위를 제어하고 인대를 강화하는 감압 추나 & 약침",
    "step1": {
        "title": "요추 4-5번 전방 전위율(Meyerding 1~4단계) 정밀 진단",
        "desc": "척추 협착증 동반 여부 및 다리 저림 신경근 압박 검진"
    },
    "step2": {
        "title": "인대강화 한방 약침 & 심부 코어 전침 치료",
        "desc": "느슨해진 척추 후관절 인대를 조여주고 다열근 지지력 복원"
    },
    "step3": {
        "title": "골반 후방 경사 유도 교정 추나 & 굴곡 운동",
        "desc": "과도한 요추 전만을 줄여 신경관 압박 재발 차단"
    }
},
  'allergic-rhinitis-cold-air-sensitivity': {
    "category": "만성기침·호흡기 & 보폐고 클리닉",
    "subHook": "찬 공기나 아침 찬 기운에 콧물·재채기가 폭발할 때",
    "title": "찬바람 알레르기 비염 · 폐한증 · 보폐고 치료",
    "subTitle": "차가워진 폐를 따뜻하게 덥히고 코 점막 방어벽을 재건하는 온폐 한약",
    "step1": {
        "title": "폐한(肺寒) & 혈관운동성 비염 정밀 진단",
        "desc": "온도 변화 과민도 및 비강 점막 창백·수양성 콧물 평가"
    },
    "step2": {
        "title": "온폐 산한 소청룡탕 & 고농축 수제 보폐고",
        "desc": "폐의 찬 기운을 몰아내고 코 점막에 온기와 진액 공급"
    },
    "step3": {
        "title": "비강 온열 훈증 & 영향혈 면역 약침",
        "desc": "환절기 찬바람에도 흔들림 없는 튼튼한 코 호흡 완성"
    }
},
  'chronic-fatigue-adrenal-exhaustion-boyak': {
    "category": "맞춤보약 & 피로회복 클리닉",
    "subHook": "자고 일어나도 천근만근, 충전되지 않는 현대인의 방전 상태",
    "title": "만성 피로 증후군 · 부신 피로 · 맞춤 회복 보약",
    "subTitle": "고갈된 에너지를 채우고 코르티솔 균형을 맞추는 원방 공진단 & 경옥고",
    "step1": {
        "title": "부신 고갈(Adrenal Fatigue) & 기혈 허약 정밀 진단",
        "desc": "자율신경 활성도·만성 염증 수치·수면의 질 종합 평가"
    },
    "step2": {
        "title": "체질 맞춤 보중익기탕 & 사향공진단",
        "desc": "무너진 면역 체계를 복원하고 세포 미토콘드리아 에너지 활성화"
    },
    "step3": {
        "title": "청뇌 안신 약침 & 복부 온열 뜸 치료",
        "desc": "자율신경 밸런스를 정상화하여 아침이 상쾌한 활력 완성"
    }
},

  'acute-stiff-neck-nakchim': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '자고 일어났을 때 목 안 돌아가는 "급성 관절 잠김"',
    title: '부평 급성 낙침 · 목 결림 한방 치료',
    subTitle: '굳어버린 경추 후관절을 풀고 가동성을 되찾는 동작침 & 추나',
    step1: { title: '경추 후관절낭 감돈 & 근육 연축 정밀 진단', desc: '목 디스크 급성 방사통과의 정밀 감별 및 관절 잠김 체크' },
    step2: { title: '즉각 가동성 회복 동작침법 (MSAT)', desc: '침을 맞고 고개를 돌려 5분 만에 굳은 관절 잠김 해제' },
    step3: { title: '경추 관절 가동 추나 & 소염약침', desc: 'C커브 정상화 및 후관절 활액막염 즉각 진정' }
  },
  'allergic-rhinitis-seasonal-bopyego': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '환절기마다 터지는 콧물·재채기·눈 가려움증',
    title: '알레르기 비염 · 만성 콧물 · 보폐고 치료',
    subTitle: '면역 과민반응을 진정시키고 비강 점막 방어벽을 재건하는 한방 치료',
    step1: { title: '폐한(肺寒) & 비폐기허 점막 면역 진단', desc: '온도·습도 민감도 및 비강 점막 창백·울혈도 평가' },
    step2: { title: '전통 옹기 고농축 수제 보폐고(補肺膏)', desc: '호흡기 점막에 수분을 공급하고 항알레르기 면역 강화' },
    step3: { title: '비강 배농 청열 요법 & 면역 비염 한약', desc: '환절기에도 재발 없는 튼튼한 코 호흡 환경 완성' }
  },
  'ankle-sprain-ligament-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '삐끗한 후 멍들고 덜렁거리는 만성 발목 불안정증',
    title: '부평 발목 염좌 · 인대 파열 한방 치료',
    subTitle: '어혈 부종을 가라앉히고 거골 정렬을 맞추는 족부 추나요법',
    step1: { title: '전거비인대(ATFL) 손상 & 거골 변위 진단', desc: '1~3도 인대 파열 및 골절 감별 검사' },
    step2: { title: '어혈 배출 습부항 & 인대 강화 봉약침', desc: '조직 부종을 가라앉히고 콜라겐 증식 촉진' },
    step3: { title: '거골 정복 족부 추나 & 밸런스 회복', desc: '발목 힌지 관절 정상화로 잦은 삠 예방' }
  },
  'carpal-tunnel-wrist-pain': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '마우스 쓰거나 아기 안을 때 손끝 저림과 손목 통증',
    title: '손목터널증후군 · 수근관증후군 한방 치료',
    subTitle: '수술 없이 신경 압박을 낮추고 손목 관절을 바로잡는 감압 침구',
    step1: { title: '정중신경 압박 & 횡수근인대 비후 진단', desc: '팔렌(Phalen) 30초 신경 손상도 체크' },
    step2: { title: '수근관 미세 감압 심부 전침 & 소염약침', desc: '수술 없이 신경 압박을 낮추고 붓기 배출' },
    step3: { title: '수근골 교정 추나 & 완관절 테이핑', desc: '손목 8개 뼈의 균형 정렬 및 신경 재생' }
  },
  'cervicogenic-headache-neck-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '진통제를 먹어도 안 낫는 뒷머리 두통과 눈 피로',
    title: '경추성 두통 · 뒷목 결림 한방 치료',
    subTitle: '상부 경추 신경 압박을 해소하고 뇌척수액 순환을 돕는 추나',
    step1: { title: '상부 경추(C1-C3) 신경 압박 & 후두신경 포착', desc: '뇌 검사상 이상 없는 척추 기인 두통 감별' },
    step2: { title: '두개천골 추나 & 경추 감압 교정', desc: '목-머리 연결 신경근 압박 해제 및 뇌척수액 순환' },
    step3: { title: '후두하근 약침 & 청뇌 안신 한약', desc: '만성 뇌 피로 해소 및 편두통성 안통 완화' }
  },
  'chronic-ankle-instability-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '길 걷다 툭하면 삐끗하는 덜렁거리는 발목',
    title: '만성 발목 불안정증 · 습관성 발목 삠 치료',
    subTitle: '늘어난 인대를 조여주고 고유수용성 감각을 복원하는 한방 교정',
    step1: { title: '만성 거골 아탈구 & 전비골건 약화 진단', desc: '발목 관절 유격 및 고유수용기 감각 저하 측정' },
    step2: { title: '인대강화 봉약침 & 심부 전침 자극', desc: '늘어난 인대 콜라겐 섬유 수축 및 결합력 강화' },
    step3: { title: '족관절 모빌리제이션 추나 & 밸런스 훈련', desc: '울퉁불퉁한 길에서도 흔들림 없는 발목 지지대 구축' }
  },
  'chronic-cough-bopyego': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '3주 이상 멎지 않는 잔기침, 마른기침, 목 이물감',
    title: '만성 기침 · 잔기침 · 보폐고 한방 치료',
    subTitle: '항생제로 안 낫는 메마른 기관지 점막을 촉촉하게 적시는 수제 보폐고',
    step1: { title: '기관지 점막 건조(Dry Mucosa) & 과민도 진단', desc: '항생제·진해거담제로 안 낫는 기침 원인 분석' },
    step2: { title: '전통 옹기 고농축 수제 보폐고(補肺膏)', desc: '기관지 섬모 점액을 채워 점막 소염 및 보습' },
    step3: { title: '폐수혈 정밀 약침 & 면역 체질 강화', desc: '기관지 자생력을 높여 환절기 감기·기침 차단' }
  },
  'chronic-rhinitis-postnasal-drip': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '아침마다 목 뒤로 넘어가는 끈적한 가래와 코막힘',
    title: '만성 비염 · 후비루증후군 한방 치료',
    subTitle: '부비동 속 고인 농을 배출하고 코 점막 방어벽을 복구하는 비강 치료',
    step1: { title: '비강 점막 위축 & 후비루(PNDS) 신경 자극 분석', desc: '헛기침, 입냄새, 목 답답함의 근본 원인 체크' },
    step2: { title: '비강 한방 배농 요법 & 점막 재생 외용제', desc: '부비동 속 고인 농을 배출하고 염증 가라앉힘' },
    step3: { title: '보폐고 & 폐음 보강 맞춤 비염한약', desc: '온도·습도 변화에 민감한 코 점막 방어벽 복구' }
  },
  'cubital-tunnel-ulnar-nerve-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '4·5번째 손가락이 저리고 팔꿈치 안쪽이 찌릿할 때',
    title: '주관증후군 · 팔꿈치터널 척골신경 포착 한방 치료',
    subTitle: '팔꿈치 척골신경 주행 통로를 넓히고 손가락 마비를 예방하는 비수술 감압',
    step1: { title: '척골신경 주행로 압박 & 프로망(Froment) 징후 진단', desc: '손가락 근력 약화 및 저림 부위 정밀 감별' },
    step2: { title: '주관절 내측 감압 심부 전침 & 소염약침', desc: '신경 통로 부종 완화 및 신경막 염증 제거' },
    step3: { title: '상지 신경 가동 추나 & 인대 이완 요법', desc: '팔꿈치 굴곡 시 신경 마찰을 줄여 재발 방지' }
  },
  'damjeok-reflux-dyspepsia': {
    category: '맞춤보약 & 소화기 클리닉',
    subHook: '내시경은 정상인데 속쓰림, 명치 답답, 잦은 트림',
    title: '담적병 · 역류성식도염 한방 치료',
    subTitle: '위장 외벽 근육층의 굳어진 담적을 삭히고 위장 운동성 정상화',
    step1: { title: '위장 외벽 근육층의 담적(痰積) 굳어짐 진단', desc: '복부 타진·압진으로 위장 운동성 저하 확인' },
    step2: { title: '담적 삭힘(소담건비) & 위장관 혈류 개선', desc: '굳은 위벽을 부드럽게 풀고 가스·소화불량 해소' },
    step3: { title: '자율신경 조절 & 복부 온열 침구 치료', desc: '역류성 식도염 재발 차단 및 장부 균형 회복' }
  },
  'de-quervain-wrist-tenosynovitis': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '엄지손가락 젖힐 때 칼로 베는 듯한 손목 바깥쪽 통증',
    title: '드퀘르벵 · 손목건초염 한방 약침 치료',
    subTitle: '단무지신근·장무지외전근 힘줄 마찰을 줄이고 염증을 가라앉히는 비수술 케어',
    step1: { title: '핑켈스타인(Finkelstein) 건초 마찰 & 활액막염 진단', desc: '엄지손가락 힘줄 염증도 및 국소 열감 평가' },
    step2: { title: '정밀 소염약침 & 완관절 심부 전침', desc: '스테로이드 부작용 없이 힘줄 건막 염증 신속 진정' },
    step3: { title: '수근골 감압 교정 & 맞춤 보호 테이핑', desc: '엄지-손목 운동역학 교정으로 만성화 차단' }
  },
  'exam-student-chongmyeongtang': {
    category: '맞춤보약 & 공진단 클리닉',
    subHook: '머리가 멍하고 집중력이 떨어지는 수험생 뇌 피로',
    title: '수험생 총명탕 · 장원환 한방 처방',
    subTitle: '전두엽 뇌 혈류를 활성화하고 시험 불안을 낮추는 맞춤 총명탕',
    step1: { title: '브레인포그 & 전두엽 집중력 저하 정밀 진단', desc: '시험 불안과 수면 부족으로 인한 뇌 과열 체크' },
    step2: { title: '원지·석창포·복신 뇌 혈류 활성화 처방', desc: '신경전달물질 분비 촉진 및 기억력 강화' },
    step3: { title: '체력 증진 & 자율신경 안정 맞춤 한약', desc: 'D-Day까지 지치지 않는 최상의 멘탈 컨디션' }
  },
  'frozen-shoulder-rotator-cuff': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '팔이 뒤로 안 올라가고 밤마다 쑤시는 어깨 통증',
    title: '부평 오십견 · 회전근개파열 한방 치료',
    subTitle: '굳어버린 견관절막 유착을 열고 가동 범위를 복원하는 한방 치료',
    step1: { title: '관절낭 유착 & 극상근건 파열 정밀 감별', desc: '어깨 전방위 관절 가동 범위(ROM) 측정' },
    step2: { title: '견관절 유착 박리 심부 전침 & 관절강 약침', desc: '단단하게 굳은 관절막을 열고 염증 제거' },
    step3: { title: '어깨 관절 가동 추나 & 근골 한약', desc: '가동 범위 정상 회복 및 야간 통증 차단' }
  },
  'golf-elbow-medial-epicondylitis': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '손잡이 쥐거나 당길 때 팔꿈치 안쪽 뻐근함',
    title: '부평 골프엘보 · 내측상과염 한방 치료',
    subTitle: '굳어진 팔뚝 굴곡근을 풀고 인대를 재건하는 1:1 맞춤 케어',
    step1: { title: '굴곡근 건초염 & 척골신경 포착 진단', desc: '팔꿈치 안쪽 인대 긴장과 관절 마찰 검사' },
    step2: { title: '심부 근막 이완 & 중성어혈약침', desc: '굳어진 팔뚝 굴곡근 섬유화 박리 및 소염' },
    step3: { title: '상지 추나요법 & 인대 재건 한약', desc: '손목-팔꿈치 정렬 교정으로 재발 방지' }
  },
  'gongjindan-selection-guide': {
    category: '맞춤보약 & 공진단 클리닉',
    subHook: '자도 자도 풀리지 않는 만성 피로와 번아웃',
    title: '정품 사향공진단 · 활력·해울·총명 공진단',
    subTitle: '식약처 CITES 정품 사향 100% 보증, 체질별 맞춤 황실 명방',
    step1: { title: '식약처 CITES 정품 인증 사향 100% 확인', desc: 'L-무스콘 유효 성분 함량 및 진품 보증' },
    step2: { title: '수승화강(水升火降) 체질별 맞춤 조제', desc: '활력공진단, 스트레스 해울공진단, 총명 N공진단' },
    step3: { title: '뇌신경 활성화 & 면역력·기력 즉각 충전', desc: '원기 회복과 두뇌 피로를 깨우는 황실 명방' }
  },
  'intercostal-neuralgia-chest-pain': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '숨 들이쉴 때마다 콕콕 쑤시고 결리는 가슴·옆구리 통증',
    title: '늑간신경통 · 가슴 옆구리 통증 한방 치료',
    subTitle: '갈비뼈 사이 신경 압박을 풀고 흉곽 팽창을 원활하게 돕는 신경 감압',
    step1: { title: '늑간신경 주행로 염증 & 흉추 후관절 변위 진단', desc: '심장·폐 질환과의 정밀 감별 및 압통점 체크' },
    step2: { title: '늑간근 이완 정밀 소염약침 & 심부 침구', desc: '갈비뼈 사이 굳은 근막을 풀고 신경 자극 진정' },
    step3: { title: '흉추 감압 교정 추나 & 기혈 순환 한약', desc: '깊은 호흡 시에도 결림 없는 편안한 흉곽 복원' }
  },
  'knee-osteoarthritis-cartilage': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '계단 오르내릴 때 시큰거리고 붓는 무릎 관절',
    title: '퇴행성 무릎관절염 · 연골 마모 한방 치료',
    subTitle: '무릎 관절강 무균 염증을 잡고 연골을 재생하는 관절 한약',
    step1: { title: '관절강 간격 감소 & 활액막염 정밀 진단', desc: '1~4단계 연골 마모도 및 보행 패턴 분석' },
    step2: { title: '관절강 정밀 소염약침 & 봉약침', desc: '무릎에 찬 물을 말리고 무균성 염증 진정' },
    step3: { title: '슬관절 감압 추나 & 연골 재생 관절한약', desc: '관절 마찰 감소 및 뼈·인대 영양 공급' }
  },
  'kyungokhwa-fatigue-recovery': {
    category: '맞춤보약 & 공진단 클리닉',
    subHook: '기력 저하, 면역력 결핍, 수술 후 회복기 보약',
    title: '전통 원방경옥고 · 72시간 옹기 중탕',
    subTitle: '동의보감 전통 제법 3일 주야 숙성으로 온 가족 면역력 증진',
    step1: { title: '6년근 생지황·인삼·복령·꿀의 황금 배합', desc: '동의보감 전통 제법 3일 주야 옹기 숙성' },
    step2: { title: '폐음(肺陰) 보충 & 조혈 기능 촉진', desc: '만성 소모성 질환 및 마른기침, 피로 회복' },
    step3: { title: '온 가족 면역력 증진 & 항산화 효능', desc: '남녀노소 부담 없이 복용하는 순수 보약' }
  },
  'leg-edema-bujonghwan': {
    category: '만성부종 & 순환 클리닉',
    subHook: '오후만 되면 신발이 끼고 밤마다 쥐 나는 종아리',
    title: '퇴근길 종아리 부종 · 부종환 엔오',
    subTitle: '정맥 판막 혈류를 가속하고 림프 노폐물을 배출하는 한방 순환 치료',
    step1: { title: '하지 정맥 판막 부전 & 수독(水毒) 정체 진단', desc: '함요 부종 및 세포간질액 울혈 상태 체크' },
    step2: { title: '서근이수(舒筋利水) 당귀작약산 가감방', desc: '복령·택사로 붓기 배출 & 작약으로 근육 이완' },
    step3: { title: '산화질소(NO) 림프관 확장 & 비복근 약침', desc: '미세 모세혈관을 능동적으로 열어 혈류 가속' }
  },
  'lumbar-disc-sciatica-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '의자에 앉기 힘들고 다리까지 찌릿한 방사통',
    title: '부평 허리디스크 · 좌골신경통 한방 추나',
    subTitle: '척추 내부 음압을 유도하여 튀어나온 수핵을 흡수시키는 비수술 치료',
    step1: { title: '수핵 탈출 & L4-L5 신경근 염증 정밀 진단', desc: '하지직거상(SLR) 척수 신경 압박도 체크' },
    step2: { title: 'COX 굴곡신연 척추 감압 추나요법', desc: '디스크 내부 음압 유도로 튀어나온 수핵 흡수' },
    step3: { title: '척수신경 소염약침 & 신경 재생 한약', desc: '신경막 무균 염증 제거 및 척추 기립근 강화' }
  },
  'morning-facial-hand-edema-bujonghwan': {
    category: '만성부종 & 순환 클리닉',
    subHook: '자고 일어나면 얼굴이 달덩이, 손가락 반지 꽉 낌',
    title: '아침 안면 · 손가락 부종 · 부종환 엔오',
    subTitle: '신장 부담 없이 탁한 림프 노폐물만 배출하는 이수소종 한방 처방',
    step1: { title: '검사상 이상 없는 특발성 부종 & 수독 분석', desc: '류마티스 조조강직과의 명확한 감별 진단' },
    step2: { title: '신장 부담 없는 한방 이수소종(利水消腫)', desc: '맑은 체액은 보존하고 탁한 림프 노폐물만 배출' },
    step3: { title: '안면 림프 배액 & 손가락 관절 이완 침구', desc: '아침마다 가볍고 또렷한 얼굴선 복원' }
  },
  'night-leg-cramp-circulatory-bujonghwan': {
    category: '만성부종 & 순환 클리닉',
    subHook: '새벽마다 비복근이 뒤틀리고 발가락 꼬이는 고통',
    title: '야간 다리 쥐(경련) · 작약감초탕 & 부종환',
    subTitle: '마그네슘으로 안 풀리는 혈류 정체를 해소하고 근육 경련을 차단',
    step1: { title: '마그네슘으로 안 풀리는 하지 정맥 울혈 진단', desc: '혈류 정체로 인한 근막 산소 결핍(허혈) 분석' },
    step2: { title: '천연 근육이완의 최고 명방 작약감초탕', desc: '파에오니플로린 성분이 과열된 근육 수축 차단' },
    step3: { title: '부종환 엔오 & 비복근 심부 어혈약침', desc: '야간 통증 없이 깊고 편안한 숙면 보장' }
  },
  'pelvic-asymmetry-correction-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '골반이 틀어지고 치마가 한쪽으로 돌아갈 때 "체형 불균형"',
    title: '부평 골반 비대칭 · 틀어진 골반 교정 추나',
    subTitle: '장골·천골 변위를 바로잡고 만성 요통과 다리 길이 차이를 해결하는 비수술 치료',
    step1: { title: '골반 비틀림 & 다리 길이 차이 정밀 진단', desc: '장골 전후방 회전변위 및 천장관절 기능 장애 측정' },
    step2: { title: '골반 분절 교정 추나 & 이상근 이완 심부 전침', desc: '골반 수평축 복원 및 좌골신경 압박 완화' },
    step3: { title: '체형 안정화 한방 침구 & 근막 강화', desc: '척추-골반 지지대 회복으로 요통 재발 차단' }
  },
  'plantar-fasciitis-heel-pain': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '아침 첫발 디딜 때 뒤꿈치가 찢어질 듯한 통증',
    title: '족저근막염 · 발바닥 통증 한방 치료',
    subTitle: '뒤꿈치 염증을 신속히 배출하고 아킬레스건을 이완하는 맞춤 약침',
    step1: { title: '종골 부착부 미세 파열 & 족궁(Arch) 분석', desc: '비복근 단축 및 발바닥 충격 흡수 장애 진단' },
    step2: { title: '족저근막 소염약침 & 종아리 근막 이완', desc: '뒤꿈치 염증 신속 배출 및 아킬레스건 이완' },
    step3: { title: '발목-골반 밸런스 추나 & 재생 치료', desc: '족부 하중 분산 및 재발 없는 보행 복원' }
  },
  'postpartum-body-pain-sanhuboyak': {
    category: '맞춤보약 & 여성 클리닉',
    subHook: '출산 후 온몸 뼈마디가 시리고 쑤시는 산후풍 증상',
    title: '산후풍 예방 · 산후 관절통 · 1:1 산후보약',
    subTitle: '이완된 관절과 인대를 조이고 기혈을 돋우는 수유 안심 맞춤 한약',
    step1: { title: '릴랙신 호르몬 관절 이완 & 기혈 허손 정밀 진단', desc: '손목·골반·무릎 시림 및 체온 조절 이상 체크' },
    step2: { title: '오로 배출 1단계 & 기혈 보강 2단계 처방', desc: '자궁 수축 촉진 및 뼈마디 시림 원천 차단' },
    step3: { title: '수유 중에도 100% 안전한 규격 한약재 조제', desc: '산모 체력 회복과 신생아 건강을 동시에 지키는 명방' }
  },
  'postpartum-surgery-edema-bujonghwan': {
    category: '만성부종 & 순환 클리닉',
    subHook: '출산 후 안 빠지는 붓기 & 수술 후 뭉친 멍과 부종',
    title: '산후 붓기 · 수술 후 부종 · 부종환 엔오',
    subTitle: '호박즙 대신 피멍과 어혈을 신속히 배출하는 양혈거어 맞춤 한약',
    step1: { title: '단순 이뇨제(호박즙)의 한계와 어혈성 부종 분석', desc: '기혈 허약과 파열된 모세혈관 복구 필요성 진단' },
    step2: { title: '양혈거어(養血祛瘀) 당귀작약산 복합 처방', desc: '자궁 오로 및 피멍 배출, 손상된 림프관 재생' },
    step3: { title: '산후풍 예방 & 섬유화 조직 연화 치료', desc: '수유 중에도 안전한 규격 한약재 1:1 조제' }
  },
  'sinusitis-chronic-congestion': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '누런 콧물, 안면 통증, 머리가 멍한 지독한 코막힘',
    title: '만성 축농증 · 부비동염 한방 치료',
    subTitle: '부비동 내 화농성 분비물을 시원하게 배출하는 한방 쾌비 배농 치료',
    step1: { title: '부비동 자연공 폐쇄 & 환기 장애 정밀 진단', desc: '항생제 내성으로 반복되는 만성 염증 분석' },
    step2: { title: '한방 쾌비 배농 치료 & 비강 정화 요법', desc: '부비동 내 화농성 분비물 시원하게 배출' },
    step3: { title: '청열해독 비강 한약 & 면역 방어벽 강화', desc: '재발 없는 건강한 호흡 통로 완성' }
  },
  'spinal-stenosis-claudication': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '10분만 걸어도 다리가 터질 듯 저리고 쑤시는 파행',
    title: '척추관협착증 · 신경인성 파행 한방 치료',
    subTitle: '수술 없이 척추관 공간을 확보하고 보행 거리를 늘리는 감압 추나',
    step1: { title: '황색인대 비후 & 척추관 좁아짐 정밀 분석', desc: '허리디스크와의 보행 거리 차이 감별 진단' },
    step2: { title: '척추 감압 굴곡 추나 & 신경약침', desc: '척추관 공간을 확보하여 신경 혈류 개선' },
    step3: { title: '척추 심부 인대 강화 한약', desc: '수술 없이 보행 거리를 늘리고 다리 힘 회복' }
  },
  'tennis-elbow-lateral-epicondylitis': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '물건 들거나 비틀 때 찌릿한 팔꿈치 통증의 악순환',
    title: '부평 테니스엘보 · 외측상과염 한방 치료',
    subTitle: '손상된 힘줄 건증을 회복하고 팔꿈치 관절을 바로잡는 비수술 치료',
    step1: { title: 'ECRB 힘줄 건증(Tendinosis) 정밀 진단', desc: '미세 파열과 저혈관 부위의 산소 결핍 분석' },
    step2: { title: '소염약침 & 심부 근막 이완 & 정밀 소염약침', desc: '스테로이드 없이 염증 배출 및 혈류 공급' },
    step3: { title: '주관절 감압 추나 & 인대 강화 한약', desc: '콜라겐 합성 촉진 및 팔꿈치 운동사슬 정상화' }
  },
  'tinnitus-dizziness-autonomic-care': {
    category: '맞춤보약 & 신경 클리닉',
    subHook: '귀에서 삐- 소리와 머리가 핑 도는 만성 어지럼증',
    title: '이명 · 어지럼증 · 자율신경 뇌 혈류 한방 치료',
    subTitle: '경추 정렬을 바로잡고 내이 혈류를 개선하는 두개천골 추나 & 청신 한약',
    step1: { title: '상부경추 아탈구 & 내이 달팽이관 허혈 진단', desc: '이비인후과 검사상 이상 없는 척추·신경 기인성 감별' },
    step2: { title: '경추-두개골 교정 추나 & 측두근 이완 약침', desc: '추골동맥 혈류를 열어 귀 신경계 산소 공급 촉진' },
    step3: { title: '청신안신(淸神安神) 맞춤 한약 처방', desc: '과흥분된 청신경 진정 및 만성 뇌 피로 회복' }
  },
  'tmj-jaw-clicking-pain': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '입 벌릴 때 딱딱 소리와 통증, 턱 비대칭',
    title: '턱관절 장애 · 개구장애 한방 치료',
    subTitle: '턱의 중심축을 바로잡아 디스크 마찰을 없애는 FCST 교정 추나',
    step1: { title: '턱관절 디스크 변위 & 교근·측두근 긴장 진단', desc: '턱 소리, 입 안 벌어짐, 두통 연관성 체크' },
    step2: { title: '턱관절 교정 추나 (FCST) & 상부경추 정렬', desc: '턱의 중심축을 바로잡아 디스크 마찰 제거' },
    step3: { title: '저작근 심부 약침 & 신경 안정 치료', desc: '수면 중 이갈이·이악물기 완화 및 안면 밸런스' }
  },
  'traffic-accident-autonomic-trauma': {
    category: '교통사고 후유증 & 자동차보험 케어',
    subHook: '사고 후 가슴 두근거림, 불안, 불면, 깜짝 놀람',
    title: '교통사고 외상후 스트레스 · 심담허겁 한방 치료',
    subTitle: '과열된 교감신경을 진정시키고 놀란 심장을 달래는 안신 한약',
    step1: { title: '급성 충격 후 자율신경 불균형 & 심담허겁 진단', desc: '두근거림, 소화장애, 수면장애 종합 평가' },
    step2: { title: '온담탕·가미소요산 계열 맞춤 안신 한약', desc: '놀란 신경계를 가라앉히고 미세 어혈 동시 제거' },
    step3: { title: '자율신경 조절 침구 & 전신 이완 케어', desc: '자동차보험 100% 적용 (본인부담금 0원)' }
  },
  'traffic-accident-concussion-headache': {
    category: '교통사고 후유증 & 자동차보험 케어',
    subHook: '사고 후 머리가 멍하고 어지러움, 메스꺼움, 불면',
    title: '교통사고 뇌진탕 증후군 · 신경 안정 한방 치료',
    subTitle: '과열된 뇌 신경계를 진정시키고 뇌 혈류를 회복하는 청뇌안신 한약',
    step1: { title: '뇌 미세 충격 & 자율신경 불균형 정밀 평가', desc: '두통, 이명, 어지럼증, 불안 장애 종합 진단' },
    step2: { title: '청뇌안신(淸腦安神) 한약 & 두개천골 추나', desc: '과열된 뇌 신경계를 진정시키고 뇌 혈류 회복' },
    step3: { title: '맞춤 통원 집중 치료 (자동차보험 0원)', desc: '만성 신경 쇠약으로의 진행 원천 차단' }
  },
  'traffic-accident-rib-back-sprain': {
    category: '교통사고 후유증 & 자동차보험 케어',
    subHook: '숨 쉴 때마다 결리고 콕콕 쑤시는 등과 옆구리',
    title: '교통사고 늑골 염좌 · 등 결림 한방 치료',
    subTitle: '안전벨트 압박으로 인한 늑간 신경통 완화 및 흉추 교정 추나',
    step1: { title: '안전벨트 압박 늑골 염좌 & 흉추 변위 진단', desc: '미세 골절 감별 및 늑간신경통 체크' },
    step2: { title: '통증 완화 침구 & 흉곽 이완 약침', desc: '호흡 시 결리는 등 근육 긴장 즉각 해소' },
    step3: { title: '흉추 교정 추나 & 어혈 한약 통원 케어', desc: '사고 후유증 없는 완전한 척추 안정화' }
  },
  'traffic-accident-whiplash': {
    category: '교통사고 후유증 & 자동차보험 케어',
    subHook: '접촉사고 후 엑스레이에 안 나오는 목·어깨 통증',
    title: '교통사고 편타성 손상 · 어혈 한약 치료',
    subTitle: '미세 혈전을 제거하는 당귀수산 한약과 척추 전신 교정 추나',
    step1: { title: '가속-감속 충격 편타성 손상(Whiplash) 진단', desc: '미세 인대 파열과 신경 자극 정밀 체크' },
    step2: { title: '어혈 배출 당귀수산 한약 & 소염약침', desc: '사고 충격으로 뭉친 미세 혈전 신속 제거' },
    step3: { title: '척추 전신 교정 추나 & 물리 치료', desc: '본인부담금 0원 (자동차보험 100% 적용)' }
  },
  'turtle-neck-chuna': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '모니터 앞 거북목과 뻐근한 뒷목, 만성 두통',
    title: '부평 거북목 · 일자목 증후군 교정 추나',
    subTitle: '굳어진 경추 C커브를 복원하고 뇌 혈류를 개선하는 체형 교정',
    step1: { title: '경추 C커브 소실 & 흉추 후만 정밀 체형 분석', desc: '상부 승모근·견갑거근 단축 긴장도 측정' },
    step2: { title: '경추 이완 추나 & 후두하근 소염약침 및 심부 전침 요법', desc: '굳은 목 관절을 열고 뇌 혈류 공급 정상화' },
    step3: { title: '1:1 맞춤 근막 강화 침구 치료', desc: '목디스크 진행 차단 및 바른 척추 정렬 복원' }
  },
  'vocal-cord-nodules-hoarse-voice': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '목소리가 쉬고 갈라지는 강사·교사의 직업병',
    title: '성대결절 · 쉰 목소리 · 보폐고 치료',
    subTitle: '수술 없이 굳은 성대 결절을 부드럽게 연화하고 본래 목소리 복원',
    step1: { title: '성대 점막 마찰 충돌 & 미세 굳은살(결절) 진단', desc: '성대 폴립 및 만성 인후염 진행도 체크' },
    step2: { title: '성대 점막 윤활액 공급 보폐고(補肺膏)', desc: '수술 없이 굳은 결절 조직을 부드럽게 연화' },
    step3: { title: '인후 소염약침 & 발성 피로 회복 한약', desc: '맑고 편안한 본래의 목소리 톤 회복' }
  },
  'myofascial-rhomboid-scapular-pain': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '모니터만 보면 날개뼈 안쪽이 칼로 찌르듯 결리는 등 통증',
    title: '부평 날개뼈 통증 · 능형근 담결림 한방 치료',
    subTitle: '굽은 등을 펴고 굳어진 능형근 근막통증유발점을 푸는 흉추 추나 & 약침',
    step1: { title: '능형근·견갑거근 발통점(Trigger Point) & 흉추 후만 정밀 진단', desc: '목디스크 방사통과의 정밀 감별 및 견갑골 가동성 체크' },
    step2: { title: '심부 근막 이완 전침 & 정밀 소염약침', desc: '굳어버린 통증유발점을 직접 이완하고 젖산 노폐물 배출' },
    step3: { title: '흉추 신연 감압 추나 & 능형근 스트레칭', desc: '굽은 등을 펴고 견갑골을 제자리로 정렬하여 재발 방지' }
  },
  'globus-hystericus-throat-lump-bopyego': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '삼켜도 안 넘어가고 뱉어도 안 나오는 목 안의 걸림감',
    title: '만성 목 이물감 · 매핵기 · 보폐고 한방 치료',
    subTitle: '스트레스로 굳은 인후부 기체(氣滯)를 풀고 점막을 적시는 반하후박탕 & 보폐고',
    step1: { title: '인후두 역류 & 기체(氣滯) 울결 매핵기 정밀 감별 진단', desc: '상부 식도 괄약근 긴장도 및 점막 건조도 종합 평가' },
    step2: { title: '전통 옹기 고농축 수제 보폐고 & 반하후박탕 가감방', desc: '인후 점막에 윤활액을 공급하고 뭉친 담음(痰飮) 삭힘' },
    step3: { title: '인후 혈자리 정밀 약침 & 자율신경 안정 침구', desc: '과열된 교감신경을 진정시키고 목구멍 압박감 즉각 해소' }
  },
  'bupyeong-night-weekend-clinic-guide': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '퇴근길에도 여유로운 진료, 바쁜 직장인을 위한 1인실 케어',
    title: '부평역 야간진료 · 토요일 진료 안내',
    subTitle: '월·수·금 저녁 8시 야간진료 & 토요일 09~15시 점심시간 없는 1인실 맞춤 치료',
    step1: { title: '직장인 통증 단계별 정밀 체형 분석', desc: '모니터 앞 거북목·굽은 등 및 척추 관절 정렬 진단' },
    step2: { title: '퇴근길 집중 동작침 & 소염약침 & 추나', desc: '야근과 만성 피로로 굳은 목·허리 즉각 이완' },
    step3: { title: '독립된 1인 프라이빗 치료실 완비', desc: '조용하고 위생적인 1인실에서 누리는 온전한 휴식' }
  },
  'traffic-accident-insurance-claims-guide': {
    category: '교통사고 후유증 & 자동차보험 케어',
    subHook: '접촉사고 후 엑스레이에 안 나오는 목·허리 통증과 어혈',
    title: '부평 교통사고 후유증 · 자동차보험 가이드',
    subTitle: '대인접수번호 하나로 어혈 한약부터 추나까지 본인부담금 0원 1:1 집중 치료',
    step1: { title: '편타성 손상 & 미세 어혈 정밀 진단', desc: '사고 충격 벡터 분석 및 자율신경계 이상 평가' },
    step2: { title: '1:1 맞춤 어혈 배출 한약 처방', desc: '체내 정체된 핏덩어리를 분해하고 염증 완화' },
    step3: { title: '척추·골반 교정 추나 & 약침 통원', desc: '자동차보험 100% 적용 (본인부담금 0원)' }
  },
  'unresolved-chronic-dry-cough-throat-clearing': {
    category: '만성기침·호흡기 & 보폐고 클리닉',
    subHook: '감기는 나았는데 3주 넘게 멎지 않는 마른기침과 목 이물감',
    title: '만성 마른기침 · 목 이물감 · 보폐고 치료',
    subTitle: '바싹 마른 기관지 점막에 진액을 채우고 과민성을 가라앉히는 보폐고',
    step1: { title: '기관지 점막 건조증 & 감각신경 과민 평가', desc: '후비루·역류성 식도염·매핵기 원인 감별' },
    step2: { title: '호흡기 점막 집중 치료제 [보폐고 엔오]', desc: '맥문동·사삼의 자음윤폐 작용으로 점막 재생' },
    step3: { title: '성대 윤활 & 인후 소염약침 치료', desc: '말할 때 목 잠김과 칼칼한 헛기침 근본 해결' }
  },
  'authentic-cites-gongjindan-fatigue-guide': {
    category: '맞춤보약 & 피로회복 클리닉',
    subHook: '시중 유사 공진단과 비교할 수 없는 정품 사향의 압도적 효능',
    title: '정품 사향공진단 · 피로회복 N공진단 가이드',
    subTitle: '식약처 CITES 정품 인증 사향과 산화질소(NO)를 결합한 1:1 맞춤 보약',
    step1: { title: 'CITES 정품 인증 사향 & 녹용 분골 확인', desc: '원방 함량 준수 및 시험검사 인증 라벨 검증' },
    step2: { title: '산화질소(NO) 결합 [N공진단] 처방', desc: '모세혈관 확장으로 뇌혈류 및 체내 흡수율 극대화' },
    step3: { title: '수험생 총명 처방 & 직장인 번아웃 회복', desc: '두뇌 피로 해소와 즉각적인 신체 활력 충전' }
  },
  'standing-desk-worker-leg-edema-cramps': {
    category: '맞춤보약 & 하지순환 클리닉',
    subHook: '오후만 되면 신발이 꽉 끼고 밤마다 쥐가 나는 다리',
    title: '만성 하지 부종 · 종아리 쥐남 · 부종환 케어',
    subTitle: '근육을 풀고 수분과 어혈을 배출하는 당귀작약산 기반 [부종환 엔오]',
    step1: { title: '하지 정맥 정체 & 비신(脾腎) 수분 대사 진단', desc: '정맥 펌프 기능 저하 및 림프 순환 장애 평가' },
    step2: { title: '서근이수(舒筋利水) 특효 [부종환 엔오]', desc: '굳은 종아리 근육 이완 및 잉여 수분 배출' },
    step3: { title: '하지 순환 침구 & 부항 집중 치료', desc: '야간 다리 경련 예방 및 가볍고 매끈한 다리 복원' }
  },
  'acute-lumbago-back-sprain-chuna-insurance': {
    category: '척추·관절 & 추나 클리닉',
    subHook: '물건 들다 뚝! 허리가 굳어 꼼짝 못 할 때',
    title: '급성 요추염좌 · 허리 삐끗 · 건강보험 추나',
    subTitle: '당일 보행을 복원하는 동작침(MSAT)과 건강보험 적용 척추 추나요법',
    step1: { title: '요추 후관절낭 손상 & 근육 연축 정밀 진단', desc: '급성 허리디스크 방사통과의 30초 감별 검진' },
    step2: { title: '즉각 가동성 회복 동작침 & 소염약침', desc: '뇌 통증 회로 차단 및 굳은 척추 기립근 이완' },
    step3: { title: '건강보험 적용 골반-요추 교정 추나', desc: '연간 20회 건강보험 혜택 및 실비보험 청구 가능' }
  }
};

function getThumbnailConfig(slug, fallbackTitle = '', fallbackCategory = '') {
  if (slug && columnThumbnailDB[slug]) {
    return columnThumbnailDB[slug];
  }
  return {
    category: fallbackCategory || '척추·관절 & 추나 클리닉',
    subHook: '만성화되기 전 원인부터 바로잡는 1:1 맞춤 진료',
    title: fallbackTitle || '해아림한의원 부평점 통합진료',
    subTitle: '정밀 진단과 비수술 한방 통합 솔루션',
    step1: { title: '근본 원인 및 체질 정밀 진단', desc: '이학적 검진 및 증상별 원인 분석' },
    step2: { title: '맞춤 한방 침구 & 정밀 약침 치료', desc: '통증 완화 및 염증 배출 집중 케어' },
    step3: { title: '체형 교정 추나 & 자생력 강화 한약', desc: '재발 방지 및 전신 균형 회복' }
  };
}

function generateCleanCardSVG(params) {
  let cfg;
  if (params.slug && columnThumbnailDB[params.slug]) {
    cfg = columnThumbnailDB[params.slug];
  } else if (params.step1 && params.step2 && params.step3) {
    cfg = params;
  } else {
    cfg = getThumbnailConfig(params.slug, params.title, params.category);
  }

  const cleanTitle = escapeXML(cfg.title || params.title);
  const cleanCategory = escapeXML(cfg.category || params.category);
  const cleanSubHook = escapeXML(cfg.subHook || params.subHook);
  const cleanSubTitle = escapeXML(cfg.subTitle || params.subTitle);
  const step1 = cfg.step1 || params.step1;
  const step2 = cfg.step2 || params.step2;
  const step3 = cfg.step3 || params.step3;

  const svg = `<svg width="900" height="960" viewBox="0 0 900 960" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient (Dark Teal-Navy) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#081b18" />
      <stop offset="100%" stop-color="#061219" />
    </linearGradient>

    <!-- Card Shadow -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Outer Dark Teal/Navy Canvas -->
  <rect x="0" y="0" width="900" height="960" rx="36" fill="url(#bgGrad)" />

  <!-- Top Floating Pill (Teal / Forest Green) -->
  <g transform="translate(450, 64)">
    <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#0d9488" />
    <text x="0" y="6" font-size="16.5" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanCategory}
    </text>
  </g>

  <!-- Inner Pure White Card -->
  <g filter="url(#cardShadow)">
    <rect x="45" y="112" width="810" height="804" rx="32" fill="#ffffff" />
  </g>

  <!-- Content inside White Card -->
  <!-- 1. Sub-Hook Pill (Light Mint Green Background + Dark Green Bold Text) -->
  <g transform="translate(90, 155)">
    <rect x="0" y="0" width="620" height="38" rx="8" fill="#ecfdf5" />
    <text x="16" y="25" font-size="15.5" font-weight="900" fill="#047857" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanSubHook}
    </text>
  </g>

  <!-- 2. Main Title (High-Impact Crisp Pitch Black) -->
  <g transform="translate(90, 235)">
    <text font-size="34" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.03em">
      ${cleanTitle}
    </text>
  </g>

  <!-- 3. Subtitle Description -->
  <g transform="translate(90, 275)">
    <text font-size="18.5" font-weight="800" fill="#334155" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${cleanSubTitle}
    </text>
  </g>

  <!-- 4. Subtle Dashed Divider Line -->
  <line x1="90" y1="305" x2="810" y2="305" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- 5. Step 01 Card (Mint/Teal Accent) -->
  <g transform="translate(90, 330)">
    <rect x="0" y="0" width="720" height="114" rx="16" fill="#f0fdfa" stroke="#ccfbf1" stroke-width="1.5" />
    <!-- Number Badge Icon -->
    <rect x="18" y="20" width="74" height="74" rx="12" fill="#e6fffa" />
    <circle cx="55" cy="57" r="24" fill="#0d9488" />
    <text x="55" y="65" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">1</text>
    <!-- Card Text -->
    <text x="110" y="46" font-size="19.5" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${escapeXML(step1.title)}
    </text>
    <text x="110" y="76" font-size="14.5" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${escapeXML(step1.desc)}
    </text>
  </g>

  <!-- 6. Step 02 Card (Warm Amber Accent) -->
  <g transform="translate(90, 462)">
    <rect x="0" y="0" width="720" height="114" rx="16" fill="#fefce8" stroke="#fef08a" stroke-width="1.5" />
    <!-- Number Badge Icon -->
    <rect x="18" y="20" width="74" height="74" rx="12" fill="#fef9c3" />
    <circle cx="55" cy="57" r="24" fill="#d97706" />
    <text x="55" y="65" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">2</text>
    <!-- Card Text -->
    <text x="110" y="46" font-size="19.5" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${escapeXML(step2.title)}
    </text>
    <text x="110" y="76" font-size="14.5" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${escapeXML(step2.desc)}
    </text>
  </g>

  <!-- 7. Step 03 Card (Cool Blue Accent) -->
  <g transform="translate(90, 594)">
    <rect x="0" y="0" width="720" height="114" rx="16" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5" />
    <!-- Number Badge Icon -->
    <rect x="18" y="20" width="74" height="74" rx="12" fill="#dbeafe" />
    <circle cx="55" cy="57" r="24" fill="#2563eb" />
    <text x="55" y="65" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif">3</text>
    <!-- Card Text -->
    <text x="110" y="46" font-size="19.5" font-weight="900" fill="#0f172a" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      ${escapeXML(step3.title)}
    </text>
    <text x="110" y="76" font-size="14.5" font-weight="600" fill="#475569" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.01em">
      ${escapeXML(step3.desc)}
    </text>
  </g>

  <!-- 8. Bottom Dark Navy Footer Capsule -->
  <g transform="translate(90, 735)">
    <rect x="0" y="0" width="720" height="54" rx="14" fill="#0f172a" />
    <text x="360" y="33" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle" font-family="Pretendard, 'Malgun Gothic', sans-serif" letter-spacing="-0.02em">
      해아림한의원 부평점 · 1:1 맞춤 통합진료 클리닉 (부평역 7번 출구 도보 5분)
    </text>
  </g>
</svg>`;

  return svg;
}

module.exports = {
  generateCleanCardSVG,
  columnThumbnailDB,
  getThumbnailConfig
};
