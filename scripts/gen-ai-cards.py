#!/usr/bin/env python3
"""
AI News Card Generator — Pillow-based, monospace English design.
Usage:
  python3 gen-ai-cards.py              # regenerate ALL AI entries
  python3 gen-ai-cards.py <entry-id>   # regenerate a single entry
  python3 gen-ai-cards.py --update     # also update news-items.json + feed
"""
from PIL import Image, ImageDraw, ImageFont
import json, os, sys

W, H = 1536, 1024
OUT_DIR = '/srv/product-news-digest/public/runtime/news-images/ai'
PROJECT_DIR = '/srv/product-news-digest'
ITEMS_FILE = f'{PROJECT_DIR}/data/runtime/news-items.json'

# === Font setup ===
bold  = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSansMono-Bold.ttf', 54)
med   = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSansMono.ttf', 30)
small = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSansMono.ttf', 24)
tag_f = ImageFont.truetype('/usr/share/fonts/dejavu/DejaVuSansMono.ttf', 22)

C = '#00B4C4'   # cyan accent
D = '#152233'   # dark
G = '#708090'   # gray
LG = '#A8B8C8'  # light gray
BG = '#F8F9FB'  # background

# === Content mapping: entry_id -> {brand, title, description_lines, tags} ===
CONTENT = {
    'hermes-agent': {
        'brand': 'HERMES AGENT',
        'subtitle': 'Open-Source AI Agent Framework',
        'desc': [
            'Modular skill system with native MCP tool',
            'integration, persistent memory engine, and',
            'parallel multi-tool execution.',
        ],
        'tags': ['Skill System', 'MCP Client', 'Memory Engine', 'Terminal', 'Browser'],
        'cat': 'developer tools',
        'date': '2026-06-18',
    },
    'openclaw-agent': {
        'brand': 'OPENCLAW',
        'subtitle': 'Next-Gen Open-Source AI Coding Agent',
        'desc': [
            'Multi-model orchestration with Claude, GPT,',
            'and Gemini backends. Terminal-native experience',
            'with project-level context and automated CI/CD.',
        ],
        'tags': ['Multi-Model', 'CLI Agent', 'Auto CI/CD', 'Open Source'],
        'cat': 'developer tools',
        'date': '2026-07-14',
    },
    'openai-gpt5': {
        'brand': 'OPENAI',
        'subtitle': 'GPT-5 — Unified Reasoning + Conversation',
        'desc': [
            'First model to deeply unify the o-series reasoning',
            'chain with standard GPT conversation. Supports',
            'tool use, web search, file upload, and image gen.',
        ],
        'tags': ['GPT-5', 'GPT-5 Mini', 'GPT-5 Nano', 'Reasoning'],
        'cat': 'model launch',
        'date': '2026-07-14',
    },
    'openai-o4-mini': {
        'brand': 'OPENAI',
        'subtitle': 'o4-mini — Efficient Reasoning for Everyone',
        'desc': [
            'A smaller, faster reasoning model bringing o-series',
            'capabilities to more users. Cost-effective inference',
            'for complex math, coding, and logic tasks.',
        ],
        'tags': ['o4-mini', 'Reasoning', 'Cost-Efficient', 'ChatGPT'],
        'cat': 'model launch',
        'date': '2026-07-02',
    },
    'openai-chatgpt-canvas': {
        'brand': 'OPENAI',
        'subtitle': 'ChatGPT Canvas — Collaborative Editor',
        'desc': [
            'Expands ChatGPT from chat to a full collaborative',
            'editor. Inline document and code editing, version',
            'comparison, and real-time comments.',
        ],
        'tags': ['Canvas', 'ChatGPT Plus', 'ChatGPT Team', 'Editor'],
        'cat': 'product update',
        'date': '2026-05-12',
    },
    'anthropic-claude4': {
        'brand': 'ANTHROPIC',
        'subtitle': 'Claude 4 Series — Opus 4 + Sonnet 4',
        'desc': [
            'Claude Opus 4 flagship with state-of-the-art coding,',
            'long-context reasoning, and top scores on SWE-bench',
            'and GPQA benchmarks.',
        ],
        'tags': ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Code', 'Coding'],
        'cat': 'model launch',
        'date': '2026-07-14',
    },
    'anthropic-claude-code': {
        'brand': 'ANTHROPIC',
        'subtitle': 'Claude Code — Terminal AI Coding Agent',
        'desc': [
            'Full-repo editing, testing, and Git operations in the',
            'terminal. Powered by Claude Sonnet 4 with autonomous',
            'planning and execution of complex dev tasks.',
        ],
        'tags': ['Claude Code', 'Sonnet 4', 'Terminal Agent', 'Anthropic API'],
        'cat': 'developer tools',
        'date': '2026-07-14',
    },
    'google-gemini25': {
        'brand': 'GOOGLE',
        'subtitle': 'Gemini 2.5 Pro & Flash — Multimodal Reasoning',
        'desc': [
            '1M token context window with native multimodal',
            'reasoning. Major improvements in math, coding,',
            'and complex instruction following.',
        ],
        'tags': ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', '1M Context', 'Deep Research'],
        'cat': 'model launch',
        'date': '2026-05-21',
    },
    'google-gemma3': {
        'brand': 'GOOGLE',
        'subtitle': 'Gemma 3 — Lightweight Open Models',
        'desc': [
            'New generation of open-source lightweight models',
            'with capabilities approaching larger LLMs. Designed',
            'for on-device and edge AI deployment.',
        ],
        'tags': ['Gemma 3', 'Open Source', 'Edge AI', 'Lightweight'],
        'cat': 'model launch',
        'date': '2026-06-24',
    },
    'google-veo3': {
        'brand': 'GOOGLE',
        'subtitle': 'Veo 3 — Next-Gen AI Video Generation',
        'desc': [
            '4K resolution, longer video duration, and improved',
            'text adherence. Supports text, image, and video',
            'multimodal inputs.',
        ],
        'tags': ['Veo 3', 'VideoFX', 'ImageFX', '4K Video'],
        'cat': 'product update',
        'date': '2026-05-21',
    },
    'xai-grok-4': {
        'brand': 'XAI',
        'subtitle': 'Grok 4 — Deep Reasoning + X Platform Data',
        'desc': [
            'Larger-scale training with stronger math and coding',
            'reasoning. Deep integration with X (Twitter) real-time',
            'data. Strong performance on AIME 2025 benchmarks.',
        ],
        'tags': ['Grok 4', 'Grok 4 Mini', 'SuperGrok', 'X Platform'],
        'cat': 'model launch',
        'date': '2026-07-14',
    },
    'xai-grok-studio': {
        'brand': 'XAI',
        'subtitle': 'Grok Studio — Standalone iOS & Web App',
        'desc': [
            'Independent app for iOS and Web with Grok 4,',
            'real-time canvas, voice conversation, and image',
            'generation. xAI expands beyond X platform.',
        ],
        'tags': ['Grok Studio', 'Grok 4', 'iOS App', 'Canvas'],
        'cat': 'product update',
        'date': '2026-07-14',
    },
    'microsoft-copilot-gpt5': {
        'brand': 'MICROSOFT COPILOT',
        'subtitle': 'Copilot Upgraded to GPT-5 + Pages & Actions',
        'desc': [
            'Integrated GPT-5 base model with Copilot Pages for',
            'persistent collaboration canvas and Copilot Actions',
            'for task automation in Microsoft 365.',
        ],
        'tags': ['Copilot GPT-5', 'Copilot Pages', 'Copilot Actions', 'M365'],
        'cat': 'product update',
        'date': '2026-07-14',
    },
    'copilot-pages': {
        'brand': 'MICROSOFT COPILOT',
        'subtitle': 'Copilot Pages — AI Collaboration Canvas',
        'desc': [
            'Persistent AI-powered collaboration canvas that',
            'reimagines office workflows. Real-time co-editing',
            'with AI assistance embedded in every document.',
        ],
        'tags': ['Copilot Pages', 'Microsoft 365', 'Collaboration', 'AI Canvas'],
        'cat': 'product update',
        'date': '2026-07-14',
    },
    'deepseek-v3-0324': {
        'brand': 'DEEPSEEK',
        'subtitle': 'V3 0324 — 685B MoE Rivaling GPT-5',
        'desc': [
            '685B parameter MoE architecture with upgraded',
            'training methods. Near or above GPT-5 performance',
            'on coding, math, and multilingual benchmarks.',
        ],
        'tags': ['DeepSeek V3', 'DeepSeek R1', '685B MoE', 'Open Source'],
        'cat': 'model launch',
        'date': '2026-03-24',
    },
    'deepseek-r1-0528': {
        'brand': 'DEEPSEEK',
        'subtitle': 'R1 0528 — Enhanced Chain-of-Thought',
        'desc': [
            'Improved reasoning chain quality and multi-step',
            'complex problem solving. API pricing remains far',
            'below competitors.',
        ],
        'tags': ['DeepSeek R1', 'V3 0324', 'Chain-of-Thought', 'API'],
        'cat': 'model launch',
        'date': '2026-06-15',
    },
    'deepseek-v3-r1-context': {
        'brand': 'DEEPSEEK',
        'subtitle': '1M Token Context Window Now Available',
        'desc': [
            'Context window expanded to 1 million tokens.',
            'Full long-text capability unlocked for both V3',
            'and R1 models across all API tiers.',
        ],
        'tags': ['DeepSeek V3', 'DeepSeek R1', '1M Context', 'Long-Text'],
        'cat': 'product update',
        'date': '2026-07-14',
    },
    'deepseek-coder-v2': {
        'brand': 'DEEPSEEK',
        'subtitle': 'Coder V2 — 236B MoE SOTA Code Generation',
        'desc': [
            '236B MoE architecture achieving SOTA on HumanEval',
            'and MBPP. Supports FIM completion and multilingual',
            'code generation at competitive API pricing.',
        ],
        'tags': ['DeepSeek Coder V2', 'FIM Completion', '236B MoE', 'Multilingual'],
        'cat': 'developer tools',
        'date': '2026-05-26',
    },
    'minimax-hailuo-2': {
        'brand': 'MINIMAX',
        'subtitle': 'Hailuo AI 2.0 — Video + Speech Synthesis',
        'desc': [
            'End-to-end video generation with abab-video-2 and',
            'ultra-realistic speech synthesis T2A-01-HD. Industry',
            'leading video quality and voice naturalness.',
        ],
        'tags': ['Hailuo AI 2.0', 'abab-video-2', 'T2A-01-HD', 'Speech'],
        'cat': 'product update',
        'date': '2026-06-10',
    },
    'minimax-speech-02': {
        'brand': 'MINIMAX',
        'subtitle': 'speech-02-hd — Ultra-Realistic TTS',
        'desc': [
            'Next-gen text-to-speech with dramatically improved',
            'emotional expression and natural prosody. Supports',
            '40+ languages with 7 emotion variations.',
        ],
        'tags': ['speech-02-hd', 'TTS', '40 Languages', 'Emotion TTS'],
        'cat': 'product update',
        'date': '2026-06-28',
    },
    'kimi-k2': {
        'brand': 'KIMI',
        'subtitle': 'K2 — 1M+ Context + MoE Agent Engine',
        'desc': [
            '1M+ token context window with MoE architecture.',
            'Deeply optimized tool calling and multi-step',
            'planning for Web and App Agent scenarios.',
        ],
        'tags': ['Kimi K2', '1M Context', 'MoE', 'Web Agent'],
        'cat': 'model launch',
        'date': '2026-06-25',
    },
    'kimi-k2-api': {
        'brand': 'KIMI',
        'subtitle': 'K2 API — Context Caching Cuts Cost 90%',
        'desc': [
            'K2 API now fully open with context caching that',
            'reduces long-text inference cost by 90%. Developer',
            'platform at platform.moonshot.cn.',
        ],
        'tags': ['Kimi K2 API', 'Context Cache', '-90% Cost', 'Moonshot'],
        'cat': 'developer tools',
        'date': '2026-07-14',
    },
    'zhipu-glm4': {
        'brand': 'ZHIPU GLM',
        'subtitle': 'GLM-4 — All-Tools + AutoGLM Agent',
        'desc': [
            '128K context with unified All-Tools interface',
            '(web search, code interpreter, image gen) and',
            'AutoGLM autonomous agent capabilities.',
        ],
        'tags': ['GLM-4', 'All-Tools', 'AutoGLM', '128K Context'],
        'cat': 'model launch',
        'date': '2026-06-01',
    },
    'zhipu-cogview4': {
        'brand': 'ZHIPU GLM',
        'subtitle': 'CogView-4 — Bilingual Text-to-Image',
        'desc': [
            'Chinese-English bilingual fine-grained image',
            'generation. Supports complex prompts with precise',
            'visual detail control.',
        ],
        'tags': ['CogView-4', 'Text-to-Image', 'Bilingual', 'GLM'],
        'cat': 'product update',
        'date': '2026-07-14',
    },
    'zhipu-codegeex': {
        'brand': 'ZHIPU GLM',
        'subtitle': 'CodeGeeX 4.0 — Free AI Coding Assistant',
        'desc': [
            'Code completion, NL-to-code generation, translation',
            'and auto bug-fixing. Deep integration with VS Code,',
            'JetBrains, and Chinese IDE ecosystems.',
        ],
        'tags': ['CodeGeeX 4.0', 'GLM-4 API', 'VS Code', 'JetBrains'],
        'cat': 'developer tools',
        'date': '2026-07-14',
    },
}


def generate_card(entry_id, content, output_dir=OUT_DIR):
    """Generate a news card image for an AI entry."""
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    
    brand = content['brand']
    subtitle = content['subtitle']
    desc = content['desc']
    tags = content['tags']
    cat = content['cat']
    date = content['date']
    
    # Left accent bar
    draw.rectangle([(0, 0), (4, H)], fill=C)
    
    # Header: brand
    draw.text((60, 60), brand, fill=C, font=bold)
    draw.text((60, 130), subtitle, fill=G, font=med)
    
    # Divider
    draw.rectangle([(60, 200), (W - 60, 201)], fill='#E8EDF2')
    
    # Description block
    y = 260
    for line in desc:
        draw.text((60, y), line, fill=D if y < 400 else G, font=bold if y < 400 else med)
        y += 50 if y < 400 else 45
    
    # Feature tags
    y += 60
    cx = 60
    for tag in tags:
        tw = draw.textlength(tag, font=tag_f)
        draw.rounded_rectangle(
            [(cx, y), (cx + tw + 20, y + 34)], radius=4,
            fill='white', outline='#D0D8E0', width=1
        )
        draw.text((cx + 10, y + 5), tag, fill=C, font=tag_f)
        cx += tw + 36
    
    # Bottom bar
    draw.rectangle([(0, H - 60), (W, H - 60)], fill='#EEF1F4')
    draw.text((60, H - 44), cat, fill=C, font=small)
    draw.text((W - 300, H - 44), f"published: {date}", fill=LG, font=small)
    
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, f'{entry_id}.png')
    img.save(out_path, 'PNG', quality=95)
    return out_path


def batch_generate(update_feed=False):
    """Generate cards for all AI entries."""
    with open(ITEMS_FILE) as f:
        items = json.load(f)
    
    generated = []
    for item in items:
        eid = item.get('id', '')
        if item.get('category') != 'ai' or eid not in CONTENT:
            continue
        
        path = generate_card(eid, CONTENT[eid])
        sz = os.path.getsize(path) // 1024
        print(f'  {eid:40s} {sz:>4}KB')
        
        # Update image path in the item
        rel_path = f'/runtime/news-images/ai/{eid}.png'
        if item.get('image') != rel_path:
            item['image'] = rel_path
        generated.append(eid)
    
    if update_feed:
        with open(ITEMS_FILE, 'w') as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        
        # Regenerate feed
        import subprocess
        subprocess.run(['python3', '/tmp/regenerate-feed.py'], check=True)
        
        # Build
        subprocess.run(['npm', 'run', 'build'], check=True, cwd=PROJECT_DIR)
    
    print(f'\nGenerated {len(generated)} cards.')
    return generated


if __name__ == '__main__':
    update = '--update' in sys.argv
    single = [a for a in sys.argv[1:] if a in CONTENT]
    
    if single:
        path = generate_card(single[0], CONTENT[single[0]])
        print(f'✅ {path} ({os.path.getsize(path)//1024}KB)')
    else:
        batch_generate(update_feed=update)
