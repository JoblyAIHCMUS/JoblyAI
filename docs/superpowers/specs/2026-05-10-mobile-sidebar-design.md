# Mobile Sidebar UI Update

## Goal
Update the existing mobile sidebar in `Header.tsx` to match the provided design:
- Add `ArrowRight` icons to the "Browse Jobs" and "Browse Companies" links.
- Style the links with the primary indigo color (`text-indigo-700`).
- Remove the underline active state effect.
- Update the "Login" button outline and text to match the brand color (`text-indigo-700 border-indigo-200`).
- Maintain the overall structure (links, divider, buttons).

## Architecture
- **Location**: Inline within `apps/web/src/components/landing/Header.tsx`.
- **Dependencies**: Uses `lucide-react` icons (`ArrowRight` will be added to imports) and the existing `Button` UI component.

## Implementation Details
1. **Imports**: Add `ArrowRight` to the `lucide-react` import statement.
2. **Navigation Links**: 
   - Modify the `Link` components for "Browse Jobs" and "Browse Companies".
   - Make them `flex items-center gap-4` (or similar to space the text and arrow).
   - Use `text-indigo-700 font-bold text-lg` for the text and icon.
   - Remove the `span` that creates the bottom line active effect.
3. **Divider**: Ensure the divider line (`border-t border-slate-300`) matches the light gray line in the image.
4. **Auth Buttons**: 
   - "Sign Up" is already a solid button (`bg-indigo-600 text-white`). Keep as is.
   - "Login" is an outline button. Update its classes to use `text-indigo-700 border-indigo-200` to match the aesthetic.
