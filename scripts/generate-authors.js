import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const authorsPath = path.join(root, 'src', 'data', 'authors.json');
const avatarsDir = path.join(root, 'public', 'avatars');

const AUTHORS = [
  { id: 1, name: 'Игорь Семёнов', role: 'Главный редактор', slug: 'igor', bio: 'Курирует медицинский контент о урологии и мужском здоровье с 2018 года.' },
  { id: 2, name: 'Марина Кравцова', role: 'Медицинский редактор', slug: 'marina', bio: 'Проверяет факты и адаптирует материалы для широкой аудитории.' },
  { id: 3, name: 'Алексей Воронцов', role: 'Автор-уролог', slug: 'alexey', bio: 'Пишет о простатите, аденоме и профилактике урологических заболеваний.' },
  { id: 4, name: 'Елена Романова', role: 'Корреспондент', slug: 'elena', bio: 'Освещает новости медицины и исследования в области урологии.' },
  { id: 5, name: 'Дмитрий Орлов', role: 'Андролог-консультант', slug: 'dima', bio: 'Специализируется на мужском здоровье и гормональном балансе.' },
  { id: 6, name: 'Наталья Белова', role: 'Редактор ленты', slug: 'natalya', bio: 'Отбирает актуальные материалы из проверенных медицинских источников.' },
  { id: 7, name: 'Сергей Мельников', role: 'Автор', slug: 'sergey', bio: 'Разбирает симптомы и методы диагностики урологических болезней.' },
  { id: 8, name: 'Ольга Петрова', role: 'Редактор', slug: 'olga', bio: 'Готовит материалы о лечении и профилактике для пациентов.' },
  { id: 9, name: 'Павел Громов', role: 'Корреспондент', slug: 'pavel', bio: 'Следит за новостями клинической урологии и научных журналов.' },
  { id: 10, name: 'Анна Тихонова', role: 'Автор', slug: 'anna', bio: 'Пишет доступно о сложных медицинских темах для мужчин 40+.' },
];

const UNSPLASH_PORTRAITS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1537368910022-3d4f55fff2c9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
];

async function downloadAvatar(url, dest) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  fs.writeFileSync(dest, res.data);
}

async function main() {
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

  const authors = [];
  for (let i = 0; i < AUTHORS.length; i++) {
    const author = AUTHORS[i];
    const avatarFile = `${author.slug}.jpg`;
    const avatarPath = path.join(avatarsDir, avatarFile);
    try {
      await downloadAvatar(UNSPLASH_PORTRAITS[i], avatarPath);
      author.avatar = `/avatars/${avatarFile}`;
      console.log(`✓ Автор: ${author.name}`);
    } catch (err) {
      console.warn(`⚠  Аватар ${author.name}: ${err.message}`);
      author.avatar = '/avatars/alexey.svg';
    }
    authors.push(author);
  }

  fs.writeFileSync(authorsPath, JSON.stringify(authors, null, 2) + '\n');
  console.log(`\nСохранено ${authors.length} авторов в ${authorsPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
