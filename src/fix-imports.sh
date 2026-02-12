#!/bin/bash
# Fix type-only imports

# Fix common type imports
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { \(Caption[^}]*\) } from '\.\.\//import type { \1 } from '..\//" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { \(Video[^}]*\) } from '\.\.\//import type { \1 } from '..\//" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { \([A-Z][a-zA-Z]*\), } from 'react'/import type { \1 } from 'react'/" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { ReactNode } from 'react'/import type { ReactNode } from 'react'/" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { ButtonHTMLAttributes, forwardRef }/import type { ButtonHTMLAttributes } from 'react';\nimport { forwardRef }/" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { CSSProperties } from 'react'/import type { CSSProperties } from 'react'/" {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/import { DragEvent } from 'react'/import type { DragEvent } from 'react'/" {} \;
