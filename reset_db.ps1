Remove-Item ./prisma/dev.db
Remove-Item ./public/pictures/*
npx prisma db push
npx prisma db seed
