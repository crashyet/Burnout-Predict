"""
BurnoutLens Dashboard — Streamlit Interactive Dashboard
Capstone Project CC26-PSU352 | Coding Camp 2026 powered by DBS Foundation
Revisi: notebook Capstone_Projek_Akhir_rev.ipynb
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# ─────────────────────────── PAGE CONFIG ───────────────────────────
st.set_page_config(
    page_title="BurnoutLens Dashboard",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────── CSS CUSTOM ───────────────────────────
st.markdown("""
<style>
  .main-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 2rem 2.5rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .main-header h1 { color: #e94560; font-size: 2.8rem; margin: 0; }
  .main-header p  { color: #a8b2d8; font-size: 1rem; margin: 0.4rem 0 0; }

  .metric-card {
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    text-align: center;
  }
  .metric-card .label { color: #a8b2d8; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 1px; }
  .metric-card .value { color: #e94560; font-size: 2.2rem; font-weight: 700; margin: 0.2rem 0; }
  .metric-card .delta { color: #64ffda; font-size: 0.85rem; }

  .insight-box {
    background: #0f3460;
    border-left: 4px solid #e94560;
    border-radius: 8px;
    padding: 1rem 1.2rem;
    margin: 0.6rem 0;
  }
  .insight-box strong { color: #e94560; }
  .insight-box p { color: #ccd6f6; margin: 0; font-size: 0.9rem; }

  .section-title {
    color: #e94560;
    font-size: 1.3rem;
    font-weight: 700;
    border-bottom: 2px solid #0f3460;
    padding-bottom: 0.4rem;
    margin: 1.5rem 0 1rem;
  }

  [data-testid="stSidebar"] { background: #16213e; }
  [data-testid="stSidebar"] .stSelectbox label,
  [data-testid="stSidebar"] .stSlider label,
  [data-testid="stSidebar"] p { color: #ccd6f6 !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────── DATA GENERATORS ───────────────────────
@st.cache_data
def generate_nlp_data():
    np.random.seed(42)
    # Distribusi per sumber (dari notebook rev)
    dist = {
        'Twitter': {'anger':1100,'fear':649,'happy':956,'love':637,'sadness':1059},
        'Ricco48': {'anger':1130,'fear':911,'happy':1275,'love':760,'sadness':1003},
        'IndoNLU': {'anger':1100,'fear':636,'happy':1258,'love':754,'sadness':1100},
        'English': {'anger':3742,'fear':3012,'happy':6715,'love':1628,'sadness':4011},
    }
    rows = []
    for src, d in dist.items():
        for emo, cnt in d.items():
            rows.append({'source': src, 'emotion': emo, 'count': cnt})
    df = pd.DataFrame(rows)

    # Simulasi panjang teks per emosi
    lengths = []
    emotions = ['anger','fear','happy','love','sadness']
    for emo in emotions:
        base = {'anger':14,'fear':16,'happy':12,'love':15,'sadness':18}[emo]
        for _ in range(700):
            lengths.append((emo, max(1, int(np.random.normal(base, 5)))))
    df_len = pd.DataFrame(lengths, columns=['emotion','word_count'])
    return df, df_len

@st.cache_data
def generate_burnout_data():
    np.random.seed(7)
    n = 3000
    work      = np.clip(np.random.normal(53.13, 12, n), 30, 94)  # mean 53.13 dari notebook rev
    sleep     = np.clip(np.random.normal(6.5, 1.2, n), 3, 10)
    overtime  = np.clip(np.random.normal(12, 6, n), 0, 40)
    total_work = work + overtime

    # burnout_score skala 1-10, korelasi: work |r|=0.4922, sleep |r|=0.1331 (dari notebook rev)
    score_raw = (total_work/94)*7 + ((8-sleep)/5)*2.5 + np.random.normal(0,1.5,n)
    score     = np.clip(score_raw, 1, 10)
    level     = pd.cut(score, bins=[0,3.5,6.5,10], labels=['Low','Moderate','High'])

    df = pd.DataFrame({
        'work_hours_per_week':  work,
        'overtime_hours':       overtime,
        'sleep_hours':          sleep,
        'total_work':           total_work,
        'burnout_score':        score,
        'burnout_level':        level,
        'work_hours_per_day':   total_work/5,
        'sleep_deficit':        8-sleep,
        'overwork_flag':        (total_work/5 > 10.4).astype(int),
        'sleep_risk_flag':      (sleep <= 6.2).astype(int),
    })
    df['dual_risk_flag'] = ((df['overwork_flag']==1) & (df['sleep_risk_flag']==1)).astype(int)
    return df

@st.cache_data
def generate_synthetic_data():
    np.random.seed(99)
    users = [f'user_{i:04d}' for i in range(50)]
    days  = list(range(1, 31))
    rows  = []
    for u in users:
        level_seed = np.random.choice(['Low','Moderate','High'], p=[0.307,0.293,0.40])
        base_score = {'Low':20,'Moderate':50,'High':80}[level_seed]
        for d in days:
            work  = np.clip(np.random.normal(11,2), 6, 18)
            sleep = np.clip(np.random.normal(6.2,1), 3, 9)
            consec= min(d, np.random.poisson(3))
            bs    = np.clip(base_score + consec*1.2 + np.random.normal(0,5), 10, 100)
            rows.append({
                'user_id':              u,
                'day':                  d,
                'work_hours_per_day':   round(work),
                'sleep_hours':          round(sleep),
                'burnout_score':        round(bs),
                'consecutive_overwork': consec,
                'burnout_level': 'High' if bs>=66 else ('Moderate' if bs>=36 else 'Low'),
                'anchor_level':         level_seed,
            })
    df = pd.DataFrame(rows)
    df['rolling_burnout_7d'] = (
        df.groupby('user_id')['burnout_score']
          .transform(lambda x: x.shift(1).rolling(7,min_periods=1).mean())
          .fillna(df['burnout_score'])
    )
    return df

@st.cache_data
def generate_ab_data():
    # Angka HASIL REVISI dari notebook rev
    return pd.DataFrame({
        'Metrik':  ['Precision','Recall','F1-Score','FPR','Accuracy'],
        'Versi A': [1.0000,     0.5708,  0.7268,    0.0000, 0.6977],
        'Versi B': [0.9698,     0.9468,  0.9582,    0.0702, 0.9418],
    })

# ─────────────────────────── SIDEBAR ───────────────────────────────
with st.sidebar:
    st.markdown('<h2 style="color:#e94560;">🔥 BurnoutLens</h2>', unsafe_allow_html=True)
    st.markdown("**CC26-PSU352** | Coding Camp 2026")
    st.markdown("---")
    page = st.radio("📌 Navigasi", [
        "🏠 Overview",
        "❓ Business Questions",
        "⚔️ A/B Testing",
        "🔮 Simulasi Prediksi",
        "📋 Kesimpulan",
    ])
    st.markdown("---")
    st.markdown("**Tema:** Healthy Lives & Well-Being")
    st.markdown("**Model:** NLP + LSTM Time-Series")

# ─────────────────────────── HELPERS ───────────────────────────────
COLORS = {
    'Low':'#64ffda','Moderate':'#ffa500','High':'#e94560',
    'anger':'#e94560','fear':'#9b59b6','happy':'#f1c40f',
    'love':'#e91e8c','sadness':'#3498db',
}
PALETTE = ['#e94560','#ffa500','#64ffda','#3498db','#9b59b6']

def card(label, value, delta=""):
    return f"""<div class="metric-card">
        <div class="label">{label}</div>
        <div class="value">{value}</div>
        <div class="delta">{delta}</div>
    </div>"""

def insight(text):
    st.markdown(f'<div class="insight-box"><p>{text}</p></div>', unsafe_allow_html=True)

def section(title):
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)

# ═══════════════════════════ PAGES ══════════════════════════════════

# ── 1. OVERVIEW ─────────────────────────────────────────────────────
if page == "🏠 Overview":
    st.markdown("""
    <div class="main-header">
      <h1>🔥 BurnoutLens</h1>
      <p>Emotional Tracking & Burnout Prediction Platform</p>
      <p style="color:#64ffda; margin-top:0.5rem;">Capstone Project • CC26-PSU352 • DBS Foundation 2026</p>
    </div>
    """, unsafe_allow_html=True)

    cols = st.columns(4)
    kpis = [
        ("Total Data NLP","33.162","4 sumber dataset"),
        ("Data Burnout","150.000","25 kolom fitur"),
        ("Emosi Terklasifikasi","5 Kelas","anger·fear·happy·love·sadness"),
        ("Burnout Level","3 Level","Low · Moderate · High"),
    ]
    for col,(lbl,val,dlta) in zip(cols,kpis):
        col.markdown(card(lbl,val,dlta), unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)

    with col1:
        section("🎯 Latar Belakang Masalah")
        problems = [
            ("🏥","83% tenaga kesehatan Indonesia mengalami burnout sedang-berat (FKUI)"),
            ("⏰","Burnout baru terdeteksi setelah mencapai tahap kronis"),
            ("📱","Tidak ada platform pemantau emosi harian yang terintegrasi"),
            ("🚧",">75% penderita gangguan mental di negara berkembang tidak tertangani (WHO)"),
            ("📊","Data emosi kualitatif & kuantitatif tersimpan terpisah"),
        ]
        for icon,text in problems:
            st.markdown(f"**{icon}** {text}")

    with col2:
        section("💡 Solusi: BurnoutLens")
        fig = go.Figure(go.Sunburst(
            labels=["BurnoutLens","Input Teks","Input Numerik",
                    "NLP Model","LSTM Model","Mood Score","Burnout Score"],
            parents=["","BurnoutLens","BurnoutLens",
                     "Input Teks","Input Numerik","NLP Model","LSTM Model"],
            values=[10,5,5,3,3,2,2],
            branchvalues="total",
            marker_colors=["#0f3460","#e94560","#3498db",
                           "#e91e8c","#1abc9c","#ffa500","#9b59b6"],
        ))
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                          margin=dict(t=10,b=10,l=10,r=10), height=300)
        st.plotly_chart(fig, use_container_width=True)

  # ── 2. BUSINESS QUESTIONS ───────────────────────────────────────────
elif page == "❓ Business Questions":
    st.markdown('<div class="main-header"><h1>❓ Business Questions</h1><p>10 Pertanyaan Bisnis & Visualisasi Jawabannya</p></div>', unsafe_allow_html=True)

    df_b   = generate_burnout_data()
    df_nlp, df_len = generate_nlp_data()
    df_syn = generate_synthetic_data()

    bq_list = [
        "BQ-1 · Distribusi kelas emosi NLP dan seberapa parah ketimpangannya?",
        "BQ-2 · Kontribusi tiap sumber dataset — sumber mana yang paling dominan?",
        "BQ-3 · Distribusi panjang teks dan nilai optimal max_length tokenizer?",
        "BQ-4 · Seberapa kuat hubungan jam tidur dan skor burnout?",
        "BQ-5 · Fitur mana yang lebih berpengaruh dan seberapa besar selisihnya?",
        "BQ-6 · Rata-rata jam kerja, tidur, burnout berbeda antar level — seberapa besar?",
        "BQ-7 · Seberapa parah imbalance dan perbandingannya setelah Synthetic Data Generation?",
        "BQ-8 · Seberapa kuat hubungan antar fitur dan mana yang paling independen?",
        "BQ-9 · Hari ke berapa burnout melewati threshold Moderate dan High dalam 30 hari?",
        "BQ-10 · Sejauh mana distribusi synthetic mencerminkan karakteristik anchor level asli?",
    ]

    for bq in bq_list:
        with st.expander(f"**{bq}**"):
            if "BQ-1" in bq:
                total_per_emo = df_nlp.groupby('emotion')['count'].sum().reset_index()
                total_per_emo['persen'] = (total_per_emo['count']/total_per_emo['count'].sum()*100).round(2)
                total_per_emo = total_per_emo.sort_values('count', ascending=False)
                col1, col2 = st.columns(2)
                with col1:
                    fig = px.bar(total_per_emo, x='emotion', y='count', color='emotion',
                                 color_discrete_map=COLORS, title="Jumlah Data per Kelas Emosi", text='persen')
                    fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
                    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                      font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                    # st.plotly_chart(fig, use_container_width=True)
                    st.plotly_chart(
                        fig,
                        use_container_width=True,
                        key="bq1_jumlah_emosi"
                    )
                with col2:
                    fig2 = px.bar(total_per_emo, x='persen', y='emotion', orientation='h',
                                  color='emotion', color_discrete_map=COLORS,
                                  title="Proporsi (%) vs Distribusi Ideal (20%)")
                    fig2.add_vline(x=20, line_dash="dash", line_color="gray", annotation_text="Ideal 20%")
                    fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                       font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                    # st.plotly_chart(fig2, use_container_width=True)
                    st.plotly_chart(
                        fig2,
                        use_container_width=True,
                        key="bq1_proporsi_emosi"
                    )
                insight("⚠️ <strong>Insight BQ-1:</strong> 'happy' mendominasi (30.28%), 'love' paling sedikit (10.92%) → rasio imbalance <strong>2.77:1</strong>. Ditangani dengan class_weight='balanced' saat training.")

            elif "BQ-2" in bq:
                total_per_src = df_nlp.groupby('source')['count'].sum().reset_index()
                col1, col2 = st.columns(2)
                with col1:
                    fig = px.bar(total_per_src, x='source', y='count', color='source',
                                 color_discrete_sequence=PALETTE, title="Volume Data per Sumber", text='count')
                    fig.update_traces(texttemplate='%{text:,}', textposition='outside')
                    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                      font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                    # st.plotly_chart(fig, use_container_width=True)
                    st.plotly_chart(
                        fig,
                        use_container_width=True,
                        key="bq2_volume_sumber"
                    )
                with col2:
                    fig2 = px.pie(total_per_src, names='source', values='count',
                                  color_discrete_sequence=PALETTE, title="Proporsi per Sumber")
                    fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                       font_color='#ccd6f6', title_font_color='#e94560')
                    # st.plotly_chart(fig2, use_container_width=True)
                    st.plotly_chart(
                        fig2,
                        use_container_width=True,
                        key="bq2_pie_sumber"
                    )
                insight("📌 <strong>Insight BQ-2:</strong> English Archive mendominasi (58.1%, 19.281 baris). Dataset lokal Indonesia = 41.9%. Dominasi English perlu diwaspadai agar model tidak bias.")

            elif "BQ-3" in bq:
                fig_box = px.box(df_len, x='emotion', y='word_count', color='emotion',
                                 color_discrete_map=COLORS, title="Distribusi Jumlah Kata per Kelas Emosi",
                                 category_orders={'emotion':['anger','fear','happy','love','sadness']})
                fig_box.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                      font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                # st.plotly_chart(fig_box, use_container_width=True)
                st.plotly_chart(
                    fig_box,
                    use_container_width=True,
                    key="bq3_boxplot_panjang_teks"
                )
                insight("📌 <strong>Insight BQ-3:</strong> Median 12–18 kata/teks. P95 ≈ 25–30 kata → digunakan sebagai <strong>max_length tokenizer NLP</strong>.")

            elif "BQ-4" in bq:
                fig2 = px.scatter(df_b.sample(500, random_state=1), x='sleep_hours', y='burnout_score',
                                  color='burnout_level', color_discrete_map=COLORS,
                                  title="Jam Tidur vs Burnout Score (r = −0.1331)", opacity=0.5)
                fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                   font_color='#ccd6f6', title_font_color='#e94560')
                # st.plotly_chart(fig2, use_container_width=True)
                st.plotly_chart(
                    fig2,
                    use_container_width=True,
                    key="bq4_sleep_vs_burnout"
                )
                insight("📌 <strong>Insight BQ-4:</strong> Pearson r = −0.1331, p ≈ 0.000 → negatif signifikan tapi <em>lemah secara praktis</em>. Sleep_hours saja tidak cukup sebagai prediktor tunggal.")

            elif "BQ-5" in bq:
                corr_data = pd.DataFrame({
                    'Fitur': ['work_hours_per_day','overwork_flag','work_rest_ratio','sleep_deficit','sleep_risk_flag'],
                    'Korelasi': [0.492, 0.394, 0.361, 0.133, 0.107],
                }).sort_values('Korelasi', ascending=True)
                fig = px.bar(corr_data, x='Korelasi', y='Fitur', orientation='h',
                             color='Korelasi', color_continuous_scale=['#3498db','#e94560'],
                             title="Korelasi Fitur vs Burnout Score")
                fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                  font_color='#ccd6f6', title_font_color='#e94560')
                # st.plotly_chart(fig, use_container_width=True)
                st.plotly_chart(
                    fig,
                    use_container_width=True,
                    key="bq5_korelasi_fitur"
                )
                insight("📌 <strong>Insight BQ-5:</strong> Tiga fitur jam kerja paling dominan: work_hours_per_day (+0.492), overwork_flag (+0.394), work_rest_ratio (+0.361). Beban kerja adalah prediktor burnout yang dominan.")

            elif "BQ-6" in bq:
                bq6_data = pd.DataFrame({
                    'Level': ['Low','Moderate','High'],
                    'Jam Kerja/Minggu': [52.06, 60.84, 69.12],
                    'Jam Tidur/Malam':  [6.54,  6.22,  5.66],
                    'Burnout Score':    [1.82,  4.25,  6.89],
                })
                fig_bq6 = go.Figure()
                for level, color in [('Low','#64ffda'),('Moderate','#ffa500'),('High','#e94560')]:
                    row = bq6_data[bq6_data['Level']==level].iloc[0]
                    fig_bq6.add_trace(go.Bar(name=level,
                        x=['Jam Kerja/Minggu','Jam Tidur/Malam','Burnout Score'],
                        y=[row['Jam Kerja/Minggu'], row['Jam Tidur/Malam'], row['Burnout Score']],
                        marker_color=color))
                fig_bq6.update_layout(barmode='group', title="Rata-rata Fitur per Burnout Level",
                                      paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                      font_color='#ccd6f6', title_font_color='#e94560')
                # st.plotly_chart(fig_bq6, use_container_width=True)
                st.plotly_chart(
                    fig_bq6,
                    use_container_width=True,
                    key="bq6_perbandingan_level"
                )
                insight("📌 <strong>Insight BQ-6:</strong> Setiap naik satu level: jam kerja naik ~8.5 jam/minggu, jam tidur turun ~0.4 jam/malam.")

            elif "BQ-7" in bq:
                col1, col2 = st.columns(2)
                with col1:
                    ori = pd.DataFrame({'Level':['Low','Moderate','High'], 'Persen':[87.75,12.21,0.04]})
                    fig = px.bar(ori, x='Level', y='Persen', color='Level', color_discrete_map=COLORS,
                                 title="Data Asli (sebelum synthetic)", text='Persen')
                    fig.update_traces(texttemplate='%{text:.2f}%', textposition='outside')
                    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                      font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                    # st.plotly_chart(fig, use_container_width=True)
                    st.plotly_chart(
                        fig,
                        use_container_width=True,
                        key="bq7_original"
                    )
                with col2:
                    syn = pd.DataFrame({'Level':['Low','Moderate','High'], 'Persen':[30.7,29.3,40.0]})
                    fig2 = px.bar(syn, x='Level', y='Persen', color='Level', color_discrete_map=COLORS,
                                  title="Setelah Synthetic Data Generation", text='Persen')
                    fig2.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
                    fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                       font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
                    # st.plotly_chart(fig2, use_container_width=True)
                    st.plotly_chart(
                        fig2,
                        use_container_width=True,
                        key="bq7_synthetic"
                    )
                insight("⚠️ <strong>Insight BQ-7:</strong> Sebelum: Low=87.75%, Moderate=12.21%, High=0.04%. Sesudah: ketiga kelas dalam rentang 29–40%. Kelas High dari 65 → <strong>12.781 sampel</strong> ✅")

            elif "BQ-8" in bq:
                num_cols = ['work_hours_per_day','sleep_hours','burnout_score','sleep_deficit','overwork_flag','dual_risk_flag']
                corr_matrix = df_b[num_cols].corr().round(3)
                fig_heat = px.imshow(corr_matrix, color_continuous_scale='RdBu_r',
                                     title="Heatmap Korelasi Antar Fitur",
                                     text_auto=True, aspect='auto', zmin=-1, zmax=1)
                fig_heat.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                       font_color='#ccd6f6', title_font_color='#e94560')
                # st.plotly_chart(fig_heat, use_container_width=True)
                st.plotly_chart(
                    fig_heat,
                    use_container_width=True,
                    key="bq8_heatmap"
                )
                insight("✅ <strong>Insight BQ-8:</strong> work_hours dan sleep_hours hampir tidak berkorelasi (r ≈ 0.004) → <strong>aman digunakan bersama</strong> dalam model LSTM.")

            elif "BQ-9" in bq:
                avg_per_day = df_syn.groupby('day')['burnout_score'].mean().reset_index()
                fig_trend = go.Figure()
                fig_trend.add_trace(go.Scatter(x=avg_per_day['day'], y=avg_per_day['burnout_score'],
                                               mode='lines+markers', name='Rata-rata semua user',
                                               line=dict(color='#e94560', width=2.5)))
                fig_trend.add_hline(y=36, line_dash="dash", line_color="#ffa500", annotation_text="Moderate (36)")
                fig_trend.add_hline(y=66, line_dash="dash", line_color="#e94560", annotation_text="High (66)")
                fig_trend.add_vline(x=3,  line_dash="dot", line_color="#ffa500", annotation_text="Hari ke-3")
                fig_trend.add_vline(x=21, line_dash="dot", line_color="#e94560", annotation_text="Hari ke-21")
                fig_trend.update_layout(title="Tren Burnout Score 30 Hari Simulasi",
                                        xaxis_title="Hari ke-", yaxis_title="Burnout Score",
                                        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                        font_color='#ccd6f6', title_font_color='#e94560', height=400)
                # st.plotly_chart(fig_trend, use_container_width=True)
                st.plotly_chart(
                    fig_trend,
                    use_container_width=True,
                    key="bq9_trend"
                )
                insight("📌 <strong>Insight BQ-9:</strong> Burnout rata-rata melewati threshold <strong>Moderate (36) di hari ke-3</strong>, lalu <strong>High (66) di hari ke-21</strong>. Lembur ≥3 hari berturut-turut → trigger notifikasi BurnoutLens.")

            elif "BQ-10" in bq:
                compare_df = pd.DataFrame({
                    'Level':          ['Low','Moderate','High'],
                    'Original (%)':   [87.75, 12.21,  0.04],
                    'Synthetic (%)':  [30.7,  29.3,  40.0],
                })
                fig3 = go.Figure()
                fig3.add_trace(go.Bar(name='Original (%)', x=compare_df['Level'], y=compare_df['Original (%)'],
                                      marker_color='#3498db', text=compare_df['Original (%)'],
                                      texttemplate='%{text:.2f}%', textposition='outside'))
                fig3.add_trace(go.Bar(name='Synthetic (%)', x=compare_df['Level'], y=compare_df['Synthetic (%)'],
                                      marker_color='#e94560', text=compare_df['Synthetic (%)'],
                                      texttemplate='%{text:.1f}%', textposition='outside'))
                fig3.update_layout(barmode='group', title="Distribusi Level — Original vs Synthetic",
                                   paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                                   font_color='#ccd6f6', title_font_color='#e94560', yaxis=dict(range=[0,110]))
                # st.plotly_chart(fig3, use_container_width=True)
                st.plotly_chart(
                    fig3,
                    use_container_width=True,
                    key="bq10_original_vs_synthetic"
                )
                insight("✅ <strong>Insight BQ-10:</strong> Rasio imbalance dari 2.025:1 → ~1.4:1. Distribusi synthetic terbedakan jelas per level ✅")  

# # ── 2. EDA BURNOUT ──────────────────────────────────────────────────
# elif page == "📊 EDA — Burnout":
#     st.markdown('<div class="main-header"><h1>📊 EDA — Burnout Dataset</h1><p>Exploratory Data Analysis pada 150.000 data pekerja teknologi</p></div>', unsafe_allow_html=True)

#     df_b = generate_burnout_data()

#     # BQ-7: Distribusi + imbalance
#     section("BQ-7 · Distribusi & Imbalance Burnout Level (Sebelum vs Sesudah Synthetic)")
#     col1, col2 = st.columns(2)
#     with col1:
#         # Data ASLI dari notebook rev: Low=87.75%, Moderate=12.21%, High=0.04%
#         ori = pd.DataFrame({'Level':['Low','Moderate','High'], 'Persen':[87.75,12.21,0.04]})
#         fig = px.bar(ori, x='Level', y='Persen',
#                      color='Level', color_discrete_map=COLORS,
#                      title="Data Asli (sebelum synthetic)",
#                      text='Persen')
#         fig.update_traces(texttemplate='%{text:.2f}%', textposition='outside')
#         fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#         st.plotly_chart(fig, use_container_width=True)
#     with col2:
#         # Setelah synthetic: 29-40% (dari notebook rev: High 40%, Mod 29.3%, Low 30.7%)
#         syn = pd.DataFrame({'Level':['Low','Moderate','High'], 'Persen':[30.7,29.3,40.0]})
#         fig2 = px.bar(syn, x='Level', y='Persen',
#                       color='Level', color_discrete_map=COLORS,
#                       title="Setelah Synthetic Data Generation",
#                       text='Persen')
#         fig2.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
#         fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                            font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#         st.plotly_chart(fig2, use_container_width=True)

#     insight("⚠️ <strong>BQ-7 — Class Imbalance:</strong> Data asli: Low=87.75%, Moderate=12.21%, High=0.04% → rasio 2.025:1 (Low vs High). Setelah Synthetic Data Generation: ketiga kelas dalam rentang 29–40%, rasio menjadi ~1.4:1. Kelas 'High' yang semula 65 baris kini memiliki <strong>12.781 sampel</strong> ✅")

#     # BQ-4 & BQ-5: Korelasi — angka DARI NOTEBOOK REV
#     section("BQ-4 & BQ-5 · Korelasi Fitur vs Burnout Score")
#     col1, col2 = st.columns(2)
#     with col1:
#         # BQ-5 + FE insight: korelasi fitur baru vs burnout (dari notebook rev)
#         # work_hours_per_day +0.492, overwork_flag +0.394, work_rest_ratio +0.361
#         # sleep_deficit +0.133, sleep_risk_flag +0.107
#         corr_data = pd.DataFrame({
#             'Fitur': ['work_hours_per_day','overwork_flag','work_rest_ratio',
#                       'sleep_deficit','sleep_risk_flag'],
#             'Korelasi': [0.492, 0.394, 0.361, 0.133, 0.107],
#         }).sort_values('Korelasi', ascending=True)
#         fig = px.bar(corr_data, x='Korelasi', y='Fitur', orientation='h',
#                      color='Korelasi',
#                      color_continuous_scale=['#3498db','#e94560'],
#                      title="BQ-5 + FE: Korelasi Fitur vs Burnout Score")
#         fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560')
#         for i, row in corr_data.reset_index(drop=True).iterrows():
#             fig.add_annotation(x=row['Korelasi']+0.01, y=i,
#                                text=f"r = +{row['Korelasi']:.3f}",
#                                showarrow=False, font=dict(color='#64ffda', size=11))
#         st.plotly_chart(fig, use_container_width=True)

#     with col2:
#         # BQ-4: Pearson r = -0.1331 (notebook rev)
#         fig2 = px.scatter(df_b.sample(500, random_state=1), x='sleep_hours', y='burnout_score',
#                           color='burnout_level',
#                           color_discrete_map=COLORS,
#                           title="BQ-4: Jam Tidur vs Burnout Score (r = −0.1331)",
#                           opacity=0.5)
#         fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                            font_color='#ccd6f6', title_font_color='#e94560')
#         st.plotly_chart(fig2, use_container_width=True)

#     insight("📌 <strong>BQ-4:</strong> Pearson r = −0.1331, p ≈ 0.000 → negatif signifikan tapi <em>lemah secara praktis</em>. Dengan 150.000 sampel, hampir semua korelasi otomatis signifikan. Sleep_hours saja tidak cukup sebagai prediktor tunggal.<br><strong>BQ-5 + FE:</strong> Tiga fitur berbasis jam kerja jauh lebih kuat: work_hours_per_day (+0.492), overwork_flag (+0.394), work_rest_ratio (+0.361). Fitur tidur: sleep_deficit (+0.133) dan sleep_risk_flag (+0.107). Beban kerja adalah prediktor burnout yang <strong>dominan</strong>.")

#     # BQ-6: Selisih antar level
#     section("BQ-6 · Rata-rata Fitur per Burnout Level")
#     # Dari notebook rev: Low=52.06 jam, Moderate=60.84, High=69.12 | sleep: Low=6.54, Mod=6.22, High=5.66
#     bq6_data = pd.DataFrame({
#         'Level':    ['Low','Moderate','High'],
#         'Jam Kerja/Minggu': [52.06, 60.84, 69.12],
#         'Jam Tidur/Malam':  [6.54,  6.22,  5.66],
#         'Burnout Score':    [1.82,  4.25,  6.89],
#     })

#     fig_bq6 = go.Figure()
#     for level, color in [('Low','#64ffda'),('Moderate','#ffa500'),('High','#e94560')]:
#         row = bq6_data[bq6_data['Level']==level].iloc[0]
#         fig_bq6.add_trace(go.Bar(
#             name=level,
#             x=['Jam Kerja/Minggu','Jam Tidur/Malam','Burnout Score'],
#             y=[row['Jam Kerja/Minggu'], row['Jam Tidur/Malam'], row['Burnout Score']],
#             marker_color=color, text=[f"{row['Jam Kerja/Minggu']:.2f}",
#                                        f"{row['Jam Tidur/Malam']:.2f}",
#                                        f"{row['Burnout Score']:.2f}"],
#             textposition='outside',
#         ))
#     fig_bq6.update_layout(barmode='group',
#                           title="Rata-rata Fitur per Burnout Level (dari data asli)",
#                           paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560')
#     st.plotly_chart(fig_bq6, use_container_width=True)
#     insight("📌 <strong>BQ-6:</strong> Setiap naik satu level: jam kerja naik ~8.5 jam/minggu, jam tidur turun ~0.4 jam/malam. Batas antar level tidak tumpang tindih → Low ≤ 3.5, Moderate 3.6–6.5, High ≥ 6.6.")

#     # BQ-8: Korelasi antar fitur
#     section("BQ-8 · Korelasi Antar Fitur (Independensi)")
#     num_cols = ['work_hours_per_day','sleep_hours','burnout_score','sleep_deficit','overwork_flag','dual_risk_flag']
#     corr_matrix = df_b[num_cols].corr().round(3)
#     fig_heat = px.imshow(corr_matrix, color_continuous_scale='RdBu_r',
#                          title="Heatmap Korelasi Antar Fitur",
#                          text_auto=True, aspect='auto', zmin=-1, zmax=1)
#     fig_heat.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                            font_color='#ccd6f6', title_font_color='#e94560')
#     st.plotly_chart(fig_heat, use_container_width=True)
#     insight("✅ <strong>BQ-8:</strong> work_hours dan sleep_hours hampir tidak berkorelasi (r ≈ 0.004) → <strong>saling melengkapi dan aman digunakan bersama</strong> dalam model. sleep_deficit = 8−sleep_hours memiliki korelasi sempurna (−1.0) → sleep_hours dihapus untuk hindari multikolinearitas pada LSTM.")

#     # Feature Engineering — statistik deskriptif populasi
#     section("🔧 Feature Engineering — Statistik Populasi")
#     col1, col2, col3 = st.columns(3)
#     col1.metric("% Overwork (>10.4 jam/hari)", "52.4%", "lebih dari separuh populasi")
#     col2.metric("% Sleep Risk (≤6.2 jam)", "41.8%", "hampir separuh populasi")
#     col3.metric("% Dual Risk (keduanya)", "21.9%", "kelompok paling rentan")

#     # Fitur numerik per level: work_hours 10.4→12.2→13.8, work_rest 1.7→2.6→3.6, sleep_deficit 1.5→1.8→2.3
#     fe_num_data = pd.DataFrame({
#         'Level':               ['Low','Moderate','High'],
#         'Jam Kerja/Hari':      [10.4, 12.2, 13.8],
#         'Rasio Kerja:Istirahat':[1.7,  2.6,  3.6],
#         'Defisit Tidur (jam)': [1.5,  1.8,  2.3],
#     })
#     fig_fenum = go.Figure()
#     metrics   = ['Jam Kerja/Hari','Rasio Kerja:Istirahat','Defisit Tidur (jam)']
#     for level, color in [('Low','#64ffda'),('Moderate','#ffa500'),('High','#e94560')]:
#         row = fe_num_data[fe_num_data['Level']==level].iloc[0]
#         fig_fenum.add_trace(go.Bar(
#             name=level, x=metrics,
#             y=[row[m] for m in metrics],
#             marker_color=color,
#             text=[f"{row[m]:.1f}" for m in metrics],
#             textposition='outside',
#         ))
#     fig_fenum.update_layout(
#         barmode='group',
#         title="Rata-rata Fitur Numerik per Burnout Level (pola monoton ✅)",
#         paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#         font_color='#ccd6f6', title_font_color='#e94560',
#     )
#     st.plotly_chart(fig_fenum, use_container_width=True)
#     insight("📌 Semua fitur numerik baru menunjukkan pola <strong>monoton naik</strong> seiring level burnout: jam kerja/hari (10.4→12.2→13.8), rasio kerja:istirahat (1.7→2.6→3.6), defisit tidur (1.5→1.8→2.3 jam). Fitur engineering berhasil membedakan antar level secara visual ✅")

#     # Dual Risk Flag per Level
#     section("🔧 Feature Engineering — Dual Risk Flag per Level")
#     fe_data = pd.DataFrame({
#         'Level':          ['Low','Moderate','High'],
#         '% Overwork':     [47.7, 86.0, 100.0],
#         '% Sleep Risk':   [40.5, 51.3,  63.1],
#         '% Dual Risk':    [18.8, 43.5,  63.1],
#     })
#     fig_fe = go.Figure()
#     for col, color in [('% Overwork','#3498db'),('% Sleep Risk','#ffa500'),('% Dual Risk','#e94560')]:
#         fig_fe.add_trace(go.Bar(name=col, x=fe_data['Level'], y=fe_data[col],
#                                 marker_color=color, text=fe_data[col],
#                                 texttemplate='%{text:.1f}%', textposition='outside'))
#     fig_fe.update_layout(barmode='group', title="% Flag Aktif per Burnout Level",
#                          paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                          font_color='#ccd6f6', title_font_color='#e94560', yaxis=dict(range=[0,120]))
#     st.plotly_chart(fig_fe, use_container_width=True)
#     insight("📌 <strong>Insight Feature Engineering:</strong> dual_risk_flag melonjak drastis: Low (18.8%) → Moderate (43.5%) → High (63.1%). Semua user High mengalami overwork (100%). dual_risk_flag adalah <strong>fitur biner dengan diskriminasi level terbaik</strong>.")

# # ── 3. EDA NLP ──────────────────────────────────────────────────────
# elif page == "💬 EDA — NLP Emosi":
#     st.markdown('<div class="main-header"><h1>💬 EDA — Dataset NLP Emosi</h1><p>Analisis 33.162 data teks dari 4 sumber berbeda</p></div>', unsafe_allow_html=True)

#     df_nlp, df_len = generate_nlp_data()

#     # BQ-2: Kontribusi per sumber
#     section("BQ-2 · Kontribusi Tiap Sumber Dataset")
#     total_per_src = df_nlp.groupby('source')['count'].sum().reset_index()
#     total_per_src['persen'] = (total_per_src['count']/total_per_src['count'].sum()*100).round(1)

#     col1, col2 = st.columns(2)
#     with col1:
#         fig = px.bar(total_per_src, x='source', y='count',
#                      color='source', color_discrete_sequence=PALETTE,
#                      title="Volume Data per Sumber", text='count')
#         fig.update_traces(texttemplate='%{text:,}', textposition='outside')
#         fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#         st.plotly_chart(fig, use_container_width=True)
#     with col2:
#         fig2 = px.pie(total_per_src, names='source', values='count',
#                       color_discrete_sequence=PALETTE, title="Proporsi per Sumber")
#         fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                            font_color='#ccd6f6', title_font_color='#e94560')
#         st.plotly_chart(fig2, use_container_width=True)

#     insight("📌 <strong>BQ-2:</strong> English Archive mendominasi (58.1%, 19.281 baris). Dataset lokal Indonesia (Twitter+Ricco48+IndoNLU) = 41.9%. Dominasi English perlu diwaspadai agar model tidak bias ke bahasa Inggris.")

#     # BQ-1: Distribusi emosi final
#     section("BQ-1 · Distribusi Kelas Emosi — Dataset NLP Final")
#     # Dari notebook rev: happy=30.28%, love=10.92%, rasio 2.77:1
#     total_per_emo = df_nlp.groupby('emotion')['count'].sum().reset_index()
#     total_per_emo['persen'] = (total_per_emo['count']/total_per_emo['count'].sum()*100).round(2)
#     total_per_emo = total_per_emo.sort_values('count', ascending=False)

#     col1, col2 = st.columns(2)
#     with col1:
#         fig = px.bar(total_per_emo, x='emotion', y='count',
#                      color='emotion', color_discrete_map=COLORS,
#                      title="Jumlah Data per Kelas Emosi", text='persen')
#         fig.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
#         fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#         st.plotly_chart(fig, use_container_width=True)
#     with col2:
#         # Garis referensi 20% ideal
#         fig2 = px.bar(total_per_emo, x='persen', y='emotion', orientation='h',
#                       color='emotion', color_discrete_map=COLORS,
#                       title="Proporsi (%) vs Distribusi Ideal (20%)")
#         fig2.add_vline(x=20, line_dash="dash", line_color="gray",
#                        annotation_text="Ideal 20%")
#         fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                            font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#         st.plotly_chart(fig2, use_container_width=True)

#     insight("⚠️ <strong>BQ-1:</strong> 'happy' mendominasi (30.28%), 'love' paling sedikit (10.92%) → rasio imbalance <strong>2.77:1</strong>. Ini pengaruh English Archive yang happy-heavy, namun sudah diredam oleh 3 sumber Indonesia. Tergolong imbalance sedang → ditangani dengan class_weight='balanced' saat training.")

#     # Heatmap sumber × emosi
#     section("BQ-2 · Heatmap Distribusi Emosi × Sumber")
#     pivot = df_nlp.pivot(index='source', columns='emotion', values='count').fillna(0)
#     fig_h = px.imshow(pivot, color_continuous_scale='Viridis',
#                       title="Distribusi Emosi per Sumber Dataset",
#                       text_auto=True, aspect='auto')
#     fig_h.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                         font_color='#ccd6f6', title_font_color='#e94560')
#     st.plotly_chart(fig_h, use_container_width=True)

#     # BQ-3: Panjang teks
#     section("BQ-3 · Distribusi Panjang Teks per Emosi")
#     fig_box = px.box(df_len, x='emotion', y='word_count',
#                      color='emotion', color_discrete_map=COLORS,
#                      title="Distribusi Jumlah Kata per Kelas Emosi",
#                      category_orders={'emotion':['anger','fear','happy','love','sadness']})
#     fig_box.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560', showlegend=False)
#     st.plotly_chart(fig_box, use_container_width=True)
#     insight("📌 <strong>BQ-3:</strong> Median teks: 12–18 kata. P95 ≈ 25–30 kata → digunakan sebagai <strong>max_length tokenizer NLP</strong>. Teks 'sadness' cenderung lebih panjang, 'happy' lebih singkat.")

# # ── 4. DATA SINTETIS ────────────────────────────────────────────────
# elif page == "🧬 Data Sintetis":
#     st.markdown('<div class="main-header"><h1>🧬 Data Sintetis — Time-Series LSTM</h1><p>Simulasi 30 hari per user • 1.065 anchor • 31.950 baris harian</p></div>', unsafe_allow_html=True)

#     df_syn = generate_synthetic_data()

#     # BQ-9: Pola burnout 30 hari
#     section("BQ-9 · Tren Burnout — Melewati Threshold di Hari Ke Berapa?")

#     # Rata-rata semua user per hari
#     avg_per_day = df_syn.groupby('day')['burnout_score'].mean().reset_index()
#     fig_trend = go.Figure()
#     fig_trend.add_trace(go.Scatter(x=avg_per_day['day'], y=avg_per_day['burnout_score'],
#                                    mode='lines+markers', name='Rata-rata semua user',
#                                    line=dict(color='#e94560', width=2.5)))
#     fig_trend.add_hline(y=36, line_dash="dash", line_color="#ffa500",
#                         annotation_text="Threshold Moderate (36)")
#     fig_trend.add_hline(y=66, line_dash="dash", line_color="#e94560",
#                         annotation_text="Threshold High (66)")
#     # Dari notebook rev: Moderate di hari ke-3, High di hari ke-21
#     fig_trend.add_vline(x=3, line_dash="dot", line_color="#ffa500",
#                         annotation_text="Hari ke-3 (Moderate)")
#     fig_trend.add_vline(x=21, line_dash="dot", line_color="#e94560",
#                         annotation_text="Hari ke-21 (High)")
#     fig_trend.update_layout(title="Tren Rata-rata Burnout Score 30 Hari Simulasi",
#                              xaxis_title="Hari ke-", yaxis_title="Burnout Score",
#                              paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                              font_color='#ccd6f6', title_font_color='#e94560', height=400)
#     st.plotly_chart(fig_trend, use_container_width=True)
#     insight("📌 <strong>BQ-9:</strong> Burnout rata-rata melewati threshold <strong>Moderate (36) di hari ke-3</strong>, lalu melewati threshold <strong>High (66) di hari ke-21</strong>. Trigger notifikasi BurnoutLens: consecutive_overwork ≥ 3 hari → burnout naik +41.4 poin dari tanpa lembur.")

#     # Pilih user individual
#     section("BQ-9 · Profil Individual User (30 Hari)")
#     users = df_syn['user_id'].unique()
#     selected_users = st.multiselect("Pilih user:", users[:20], default=list(users[:3]))

#     if selected_users:
#         fig = go.Figure()
#         color_map = px.colors.qualitative.Plotly
#         for i, uid in enumerate(selected_users):
#             u_df = df_syn[df_syn['user_id']==uid]
#             fig.add_trace(go.Scatter(x=u_df['day'], y=u_df['burnout_score'],
#                                      name=f"{uid}", line=dict(color=color_map[i%len(color_map)], width=2),
#                                      mode='lines'))
#             fig.add_trace(go.Scatter(x=u_df['day'], y=u_df['rolling_burnout_7d'],
#                                      name=f"{uid} rolling 7d",
#                                      line=dict(color=color_map[i%len(color_map)], width=2, dash='dot'),
#                                      mode='lines', opacity=0.7))
#         fig.add_hline(y=36, line_dash="dash", line_color="#ffa500")
#         fig.add_hline(y=66, line_dash="dash", line_color="#e94560")
#         fig.update_layout(title="Burnout Score Harian vs Rolling 7 Hari",
#                           xaxis_title="Hari ke-", yaxis_title="Burnout Score",
#                           paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                           font_color='#ccd6f6', title_font_color='#e94560', height=380)
#         st.plotly_chart(fig, use_container_width=True)

#     # Burnout vs consecutive overwork
#     section("BQ-9 · Burnout Score vs Consecutive Overwork")
#     avg_by_consec = df_syn.groupby('consecutive_overwork')['burnout_score'].mean().reset_index()
#     avg_by_consec.columns = ['Consecutive Overwork','Rata-rata Burnout']
#     fig2 = px.line(avg_by_consec, x='Consecutive Overwork', y='Rata-rata Burnout',
#                    markers=True, title="Pengaruh Consecutive Overwork terhadap Burnout")
#     fig2.add_vline(x=3, line_dash="dot", line_color="#e94560",
#                    annotation_text="Trigger ≥3 hari")
#     fig2.add_hline(y=36, line_dash="dash", line_color="#ffa500")
#     fig2.add_hline(y=66, line_dash="dash", line_color="#e94560")
#     fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                        font_color='#ccd6f6', title_font_color='#e94560')
#     st.plotly_chart(fig2, use_container_width=True)

#     # BQ-10: Synthetic vs original
#     section("BQ-10 · Distribusi Synthetic vs Data Asli")
#     # Dari notebook rev: asli Low=87.75, Mod=12.21, High=0.04 | synthetic Low=30.7, Mod=29.3, High=40.0
#     compare_df = pd.DataFrame({
#         'Level':          ['Low','Moderate','High'],
#         'Original (%)':   [87.75, 12.21, 0.04],
#         'Synthetic (%)':  [30.7,  29.3,  40.0],
#     })
#     fig3 = go.Figure()
#     fig3.add_trace(go.Bar(name='Original (%)', x=compare_df['Level'],
#                           y=compare_df['Original (%)'], marker_color='#3498db',
#                           text=compare_df['Original (%)'],
#                           texttemplate='%{text:.2f}%', textposition='outside'))
#     fig3.add_trace(go.Bar(name='Synthetic (%)', x=compare_df['Level'],
#                           y=compare_df['Synthetic (%)'], marker_color='#e94560',
#                           text=compare_df['Synthetic (%)'],
#                           texttemplate='%{text:.1f}%', textposition='outside'))
#     fig3.update_layout(barmode='group',
#                        title="BQ-10: Perbandingan Distribusi Level — Original vs Synthetic",
#                        paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
#                        font_color='#ccd6f6', title_font_color='#e94560',
#                        yaxis=dict(range=[0,110]))
#     st.plotly_chart(fig3, use_container_width=True)
#     insight("✅ <strong>BQ-10:</strong> Rasio imbalance dari 2.025:1 → ~1.4:1. Selisih mean burnout: Low→Moderate +32.1 poin, Moderate→High +21.3 poin. Distribusi terbedakan jelas per level — synthetic berhasil merepresentasikan karakteristik anchor ✅")

# ── 5. A/B TESTING ──────────────────────────────────────────────────
elif page == "⚔️ A/B Testing":
    st.markdown('<div class="main-header"><h1>⚔️ A/B Testing — Strategi Threshold</h1><p>Versi A (Konservatif ≥66) vs Versi B (Agresif ≥36)</p></div>', unsafe_allow_html=True)

    df_ab = generate_ab_data()

    # Hipotesis
    section("📐 Hipotesis")
    col1, col2 = st.columns(2)
    with col1:
        st.info("**Uji 1 — Chi-Square:**\nH₀: Tidak ada perbedaan proporsi prediksi benar antara Versi A dan Versi B")
    with col2:
        st.info("**Uji 2 — Z-Test Proporsi (Recall):**\nH₀: Tidak ada perbedaan Recall antara Versi A dan Versi B")

    section("⚙️ Setup Kedua Versi")
    setup_df = pd.DataFrame({
        '':                    ['Threshold','Level yang diberi peringatan','Filosofi'],
        'Versi A — Konservatif': ['burnout_score ≥ 66','High saja','Peringatkan yang sudah kritis'],
        'Versi B — Agresif':     ['burnout_score ≥ 36','Moderate + High','Deteksi dini sebelum kritis'],
    })
    st.dataframe(setup_df, use_container_width=True, hide_index=True)

    # Hasil statistik — ANGKA DARI NOTEBOOK REV
    section("📊 Hasil Uji Statistik")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Chi-Square (χ²)", "6.438,68", "p ≈ 0.000 → Tolak H₀ ✅")
    col2.metric("Z-Statistik",     "−93.23",   "p ≈ 0.000 → Tolak H₀ ✅")
    col3.metric("CI Recall A",     "[0.56, 0.58]", "Tidak tumpang tindih dengan B")
    col4.metric("CI Recall B",     "[0.94, 0.95]", "Jauh lebih tinggi ✅")

    insight("✅ Kedua uji mengkonfirmasi perbedaan performa antara Versi A dan B <strong>signifikan secara statistik</strong> (p < 0.05) — bukan kebetulan. H₀ ditolak pada kedua uji.")

    # Perbandingan metrik — ANGKA DARI NOTEBOOK REV
    section("📈 Perbandingan Metrik Lengkap")
    fig = go.Figure()
    fig.add_trace(go.Bar(name='Versi A — Konservatif',
                         x=df_ab['Metrik'], y=df_ab['Versi A'],
                         marker_color='#3498db',
                         text=df_ab['Versi A'], texttemplate='%{text:.4f}', textposition='outside'))
    fig.add_trace(go.Bar(name='Versi B — Agresif',
                         x=df_ab['Metrik'], y=df_ab['Versi B'],
                         marker_color='#e94560',
                         text=df_ab['Versi B'], texttemplate='%{text:.4f}', textposition='outside'))
    fig.update_layout(barmode='group', yaxis=dict(range=[0,1.2]),
                      title="Perbandingan Metrik: Versi A vs Versi B",
                      paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                      font_color='#ccd6f6', title_font_color='#e94560')
    st.plotly_chart(fig, use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        # FPR vs Recall trade-off
        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(x=[0.0000], y=[0.5708], mode='markers+text',
                                  name='A — Konservatif', text=['A'], textposition='top right',
                                  marker=dict(size=20, color='#3498db')))
        fig2.add_trace(go.Scatter(x=[0.0702], y=[0.9468], mode='markers+text',
                                  name='B — Agresif', text=['B'], textposition='top right',
                                  marker=dict(size=20, color='#e94560')))
        fig2.update_layout(title="Trade-off: FPR vs Recall",
                           xaxis_title="False Positive Rate", yaxis_title="Recall",
                           paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                           font_color='#ccd6f6', title_font_color='#e94560',
                           xaxis=dict(range=[-0.02,0.15]), yaxis=dict(range=[0,1.1]))
        st.plotly_chart(fig2, use_container_width=True)

    with col2:
        # User-level detection — dari notebook rev: 916 user berisiko, A=782 (85.4%), B=916 (100%)
        user_data = pd.DataFrame({
            'Versi':             ['A — Konservatif','B — Agresif'],
            'Terdeteksi':        [782, 916],
            'Tidak Terdeteksi':  [134, 0],
        })
        fig3 = go.Figure()
        fig3.add_trace(go.Bar(name='Terdeteksi', x=user_data['Versi'], y=user_data['Terdeteksi'],
                              marker_color='#2ecc71', text=user_data['Terdeteksi'],
                              texttemplate='%{text}', textposition='inside'))
        fig3.add_trace(go.Bar(name='Terlewat (missed)', x=user_data['Versi'], y=user_data['Tidak Terdeteksi'],
                              marker_color='#e94560', text=user_data['Tidak Terdeteksi'],
                              texttemplate='%{text}', textposition='inside'))
        fig3.update_layout(barmode='stack',
                           title="User-Level Detection (dari 916 user berisiko)",
                           paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
                           font_color='#ccd6f6', title_font_color='#e94560')
        st.plotly_chart(fig3, use_container_width=True)

    section("✅ Rekomendasi Final")
    st.success("""
    **PILIH VERSI B — AGRESIF (threshold ≥ 36)**

    Dalam konteks kesehatan mental, **Recall jauh lebih penting dari Precision** —
    melewatkan kasus burnout (false negative) jauh lebih berbahaya daripada mengirim notifikasi berlebih (false positive).

    | Metrik | Versi A | Versi B |
    |--------|---------|---------|
    | Precision | 1.0000 | 0.9698 |
    | Recall | 0.5708 | **0.9468** |
    | F1-Score | 0.7268 | **0.9582** |
    | FPR | 0.0000 | 0.0702 |
    | Accuracy | 0.6977 | **0.9418** |

    Versi B: **Recall 0.9468**, F1 **0.9582**, **100% dari 916 user berisiko terdeteksi** (0 terlewat).
    Versi A melewatkan **134 pengguna** yang tidak pernah mendapat peringatan sepanjang 30 hari simulasi.
    """)

# ── 6. SIMULASI PREDIKSI ────────────────────────────────────────────
elif page == "🔮 Simulasi Prediksi":
    st.markdown('<div class="main-header"><h1>🔮 Simulasi Prediksi Burnout</h1><p>Input data harian → estimasi risiko burnout berbasis threshold EDA</p></div>', unsafe_allow_html=True)

    st.info("💡 Simulasi ini menggunakan threshold hasil EDA: overwork >10.4 jam/hari, sleep risk ≤6.2 jam, trigger notifikasi ≥3 hari lembur berturut-turut.")

    col1, col2 = st.columns(2)
    with col1:
        section("📥 Input Data Harian")
        work_hours  = st.slider("Total jam kerja/minggu (reguler)",  20, 80, 45)
        overtime    = st.slider("Jam lembur/minggu",                  0, 40, 10)
        sleep_h     = st.slider("Rata-rata jam tidur/malam",         3.0, 10.0, 6.5, 0.5)
        consec_ow   = st.slider("Hari lembur berturut-turut",         0, 30, 4)

    with col2:
        section("📤 Hasil Estimasi")

        total_wk   = work_hours + overtime
        wpd        = total_wk / 5
        sleep_def  = 8 - sleep_h
        wrt        = wpd / max(24 - wpd - sleep_h, 0.1)
        overwork   = 1 if wpd > 10.4 else 0
        sleep_risk = 1 if sleep_h <= 6.2 else 0
        dual_risk  = 1 if (overwork and sleep_risk) else 0

        # Heuristik berdasarkan threshold EDA (skala 10-100 sesuai notebook rev)
        score = (
            (wpd / 18.8) * 50 +
            (sleep_def / 5) * 25 +
            dual_risk * 15 +
            (consec_ow / 30) * 10
        )
        score = min(max(score, 10), 100)
        level = "High" if score >= 66 else ("Moderate" if score >= 36 else "Low")
        color = {'Low':'#64ffda','Moderate':'#ffa500','High':'#e94560'}[level]

        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=round(score, 1),
            delta={'reference': 36, 'increasing': {'color':'#e94560'}},
            gauge={
                'axis': {'range':[10,100]},
                'steps': [
                    {'range':[10,35], 'color':'#064e3b'},
                    {'range':[36,65], 'color':'#78350f'},
                    {'range':[66,100],'color':'#7f1d1d'},
                ],
                'threshold': {'line':{'color':color,'width':4},'value':score},
                'bar': {'color': color},
            },
            title={'text': f"Burnout Score\n<b>{level}</b>", 'font':{'color':color,'size':18}},
            number={'font':{'color':color,'size':40}},
        ))
        fig_gauge.update_layout(paper_bgcolor='rgba(0,0,0,0)', font_color='#ccd6f6',
                                 height=300, margin=dict(t=60,b=20,l=20,r=20))
        st.plotly_chart(fig_gauge, use_container_width=True)

        if level == "High":
            st.error("🚨 **Risiko Tinggi!** Segera kurangi beban kerja dan pertimbangkan konsultasi ke profesional.")
        elif level == "Moderate":
            st.warning("⚠️ **Perhatian!** Anda mulai berisiko burnout. Prioritaskan istirahat.")
        else:
            st.success("✅ **Kondisi Baik.** Pertahankan keseimbangan kerja-istirahat Anda.")

    # Notifikasi trigger
    if consec_ow >= 3:
        st.error(f"🔔 **TRIGGER NOTIFIKASI AKTIF:** {consec_ow} hari lembur berturut-turut ≥ threshold 3 hari (dari BQ-9)")
    else:
        st.info(f"🔕 Belum trigger: {consec_ow} hari lembur berturut-turut (trigger di ≥3 hari)")

    section("🔍 Detail Feature Engineering")
    feat_df = pd.DataFrame({
        'Fitur':     ['work_hours_per_day','sleep_deficit','work_rest_ratio',
                      'overwork_flag','sleep_risk_flag','dual_risk_flag'],
        'Nilai':     [round(wpd,2), round(sleep_def,2), round(wrt,3),
                      overwork, sleep_risk, dual_risk],
        'Threshold': ['>10.4 = overwork','>0 = kurang dari WHO','semakin tinggi = tertekan',
                      '1 = Ya','1 = Ya','1 = Keduanya aktif'],
        'Status':    [
            "⚠️ Overwork"  if overwork    else "✅ Normal",
            "⚠️ Defisit"   if sleep_def>0 else "✅ Cukup",
            "⚠️ Tinggi"    if wrt>1.5     else "✅ Normal",
            "⚠️"           if overwork    else "✅",
            "⚠️"           if sleep_risk  else "✅",
            "🚨 Dual Risk" if dual_risk   else "✅",
        ]
    })
    st.dataframe(feat_df, use_container_width=True, hide_index=True)

    section("💊 Rekomendasi Personal")
    recs = []
    if overwork:
        recs.append("🏃 **Kurangi jam kerja:** Target maksimal 10.4 jam/hari (threshold EDA BQ-3)")
    if sleep_risk:
        recs.append("😴 **Tingkatkan durasi tidur:** Minimal 6.2 jam (threshold), idealnya 8 jam (standar WHO)")
    if dual_risk:
        recs.append("🔴 **DUAL RISK aktif:** Kombinasi overwork + sleep risk → sinyal terkuat burnout (BQ-5)")
    if consec_ow >= 3:
        recs.append(f"📅 **Ambil hari libur:** {consec_ow} hari lembur berturut-turut sudah melewati trigger notifikasi (BQ-9)")
    if not recs:
        recs.append("🌟 **Kondisi optimal!** Keseimbangan kerja-istirahat Anda sudah baik.")
    for r in recs:
        st.markdown(r)

# ── 7. KESIMPULAN ───────────────────────────────────────────────────
elif page == "📋 Kesimpulan":
    st.markdown('<div class="main-header"><h1>📋 Kesimpulan & Rekomendasi</h1><p>Ringkasan seluruh insight dari proyek BurnoutLens</p></div>', unsafe_allow_html=True)

    # section("🎯 Jawaban 10 Business Questions")
    # bq_answers = [
    #     ("BQ-1","Distribusi kelas emosi NLP",
    #      "'happy' mendominasi (30.28%), 'love' paling sedikit (10.92%) → rasio imbalance 2.77:1. Pengaruh English Archive yang happy-heavy, sudah diredam sumber Indonesia. Ditangani dengan class_weight='balanced'."),
    #     ("BQ-2","Kontribusi sumber dataset",
    #      "English Archive paling dominan (58.1%, 19.281 baris). Dataset lokal Indonesia = 41.9%. Dominasi English perlu diwaspadai agar model tidak bias."),
    #     ("BQ-3","Distribusi panjang teks",
    #      "Median 12–18 kata per teks. P95 = 25–30 kata → digunakan sebagai max_length tokenizer NLP."),
    #     ("BQ-4","Hubungan jam tidur & burnout",
    #      "Pearson r = −0.1331, p ≈ 0.000 → negatif signifikan namun LEMAH secara praktis. Sleep_hours saja tidak cukup sebagai prediktor tunggal — faktor jam kerja jauh lebih menentukan."),
    #     ("BQ-5","Fitur paling berpengaruh",
    #      "3 fitur berbasis jam kerja paling dominan: work_hours_per_day (+0.492), overwork_flag (+0.394), work_rest_ratio (+0.361). Fitur tidur jauh lebih lemah: sleep_deficit (+0.133), sleep_risk_flag (+0.107). Beban kerja adalah prediktor burnout yang dominan."),
    #     ("BQ-6","Selisih antar burnout level",
    #      "Setiap naik satu level: jam kerja naik ~8.5 jam/minggu, jam tidur turun ~0.4 jam/malam. Low≤3.5, Moderate 3.6–6.5, High≥6.6."),
    #     ("BQ-7","Imbalance sebelum & sesudah synthetic",
    #      "Sebelum: 2.025:1 (Low vs High). Sesudah Synthetic Data Generation: ~1.4:1. Kelas High dari 65 baris → 12.781 sampel ✅"),
    #     ("BQ-8","Independensi antar fitur",
    #      "work_hours dan sleep_hours hampir tidak berkorelasi (r ≈ 0.004) → saling melengkapi, AMAN digunakan bersama dalam model LSTM."),
    #     ("BQ-9","Kapan burnout melewati threshold?",
    #      "Melewati Moderate (36) di hari ke-3, melewati High (66) di hari ke-21. Lembur ≥3 hari berturut-turut menaikkan burnout +41.4 poin → dijadikan trigger notifikasi BurnoutLens."),
    #     ("BQ-10","Synthetic vs data asli",
    #      "Selisih mean burnout per level: Low→Moderate +32.1 poin, Moderate→High +21.3 poin. Distribusi terbedakan jelas antar level — synthetic berhasil merepresentasikan karakteristik anchor asli ✅"),
    # ]
    # for no, judul, jawaban in bq_answers:
    #     with st.expander(f"**{no}** — {judul}"):
    #         st.markdown(f"✅ {jawaban}")
    section("🔍 Kesimpulan")
    st.markdown("""
    <div class="insight-box">
    <strong>📊 Data & Pipeline</strong>
    <p>BurnoutLens mengintegrasikan dua domain data: 33.162 teks emosi dari 4 sumber (NLP) dan 150.000 data pekerja teknologi (burnout). Pipeline mencakup EDA, feature engineering 6 fitur baru, synthetic data generation (31.950 baris dari 1.065 anchor), dan sliding window LSTM (24.495 sampel × 7 hari × 7 fitur).</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("""
    <div class="insight-box">
    <strong>🧠 Temuan Utama EDA</strong>
    <p>Beban kerja adalah prediktor burnout yang dominan (r = +0.492), bukan jam tidur (r = −0.133). Fitur <em>dual_risk_flag</em> (kombinasi overwork + sleep risk) merupakan sinyal terkuat — melonjak dari 18.8% (Low) ke 63.1% (High). Setiap naik satu level burnout: jam kerja bertambah ~8.5 jam/minggu, jam tidur berkurang ~0.4 jam/malam.</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("""
    <div class="insight-box">
    <strong>🧬 Synthetic Data</strong>
    <p>Class imbalance ekstrem pada data asli (High hanya 0.04%, 65 baris) berhasil diatasi dengan synthetic data generation. Rasio imbalance turun dari 2.025:1 menjadi ~1.4:1, dengan kelas High kini memiliki 12.781 sampel. Distribusi synthetic terbedakan jelas per level ✅</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("""
    <div class="insight-box">
    <strong>⚔️ A/B Testing — Versi B Unggul</strong>
    <p>Threshold agresif ≥36 (Versi B) jauh lebih tepat untuk konteks kesehatan mental: Recall 0.9468 vs 0.5708, F1 0.9582 vs 0.7268. Versi B berhasil mendeteksi 100% dari 916 user berisiko (0 terlewat), sementara Versi A melewatkan 134 pengguna. Perbedaan signifikan secara statistik (χ²=6.438,68, p≈0.000).</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("""
    <div class="insight-box">
    <strong>⏱️ Early Warning — Kapan Bertindak?</strong>
    <p>Burnout rata-rata melewati threshold Moderate di <strong>hari ke-3</strong> dan High di <strong>hari ke-21</strong>. Lembur ≥3 hari berturut-turut menaikkan burnout +41.4 poin → dijadikan trigger notifikasi otomatis BurnoutLens.</p>
    </div>
    """, unsafe_allow_html=True)

    section("🏆 Pencapaian Utama Proyek")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        **📊 Data Pipeline**
        - 33.162 teks emosi, 4 sumber
        - 150.000 data burnout pekerja
        - Synthetic: 1.065 anchor, 31.950 baris harian
        - 24.495 sampel sliding window LSTM
        """)
    with col2:
        st.markdown("""
        **🔧 Feature Engineering**
        - 6 fitur baru untuk burnout dataset
        - 7 fitur final untuk input LSTM (sliding window 24.495 × 7 hari × 7 fitur)
        - dual_risk_flag: sinyal terkuat (Low 18.8% → High 63.1%)
        - Anti-leakage MinMaxScaler (fit train only)
        """)
    with col3:
        st.markdown("""
        **⚔️ A/B Testing**
        - Versi B unggul: Recall=0.9468, F1=0.9582
        - 100% dari 916 user berisiko terdeteksi
        - χ²=6.438,68, z=−93.23 → signifikan
        - Threshold ≥36 direkomendasikan
        """)

    section("🚀 Rekomendasi Pengembangan")
    recs_dev = [
        ("🔬","Integrasi NLP + LSTM","Hubungkan mood score dari jurnal harian dengan prediksi burnout time-series untuk sistem multimodal yang lebih akurat."),
        ("📱","Aplikasi Mobile","Kembangkan UI mobile-friendly — pengguna input jam kerja & tidur harian, terima notifikasi peringatan dini otomatis."),
        ("🏥","Rujukan Profesional","Tambahkan fitur rujukan ke psikolog/konselor jika burnout_level terdeteksi High selama ≥3 hari berturut-turut."),
        ("🔒","Privasi Data","Enkripsi end-to-end dan data minimization — hanya simpan data yang diperlukan untuk prediksi."),
        ("📊","Monitoring Tim","Dashboard HR (anonim) untuk memantau tren burnout tim tanpa melanggar privasi individu."),
    ]
    for icon, title, desc in recs_dev:
        st.markdown(f"""
        <div class="insight-box">
          <strong>{icon} {title}</strong>
          <p>{desc}</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("""
    <div style="text-align:center; color:#a8b2d8; padding:1rem;">
      🔥 <b>BurnoutLens</b> — CC26-PSU352 | Coding Camp 2026 powered by DBS Foundation<br>
      <span style="color:#64ffda;">Tema: Healthy Lives & Well-Being</span>
    </div>
    """, unsafe_allow_html=True)
