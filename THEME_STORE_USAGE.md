# Theme Store Usage Guide

This guide shows you how to use the theme store throughout your Svelte application.

## 🏪 **Theme Store Overview**

The theme store is a Svelte store that manages the application's theme state (light/dark mode) and provides various methods for theme manipulation.

## 📥 **Import the Store**

```typescript
import { themeStore, isDark, isLight } from '$lib/stores/theme';
```

## 🎛️ **Available Store Methods**

### **Basic Usage**
```svelte
<script lang="ts">
  import { themeStore, isDark } from '$lib/stores/theme';
</script>

<!-- Toggle theme button -->
<button onclick={() => themeStore.toggle()}>
  Toggle Theme
</button>

<!-- Conditional rendering based on theme -->
{#if $isDark}
  <p>Dark mode is active</p>
{:else}
  <p>Light mode is active</p>
{/if}
```

### **Store Methods**

```typescript
// Toggle between light and dark
themeStore.toggle()

// Set specific theme
themeStore.setMode('dark')  // or 'light'

// Set to light mode
themeStore.setLight()

// Set to dark mode
themeStore.setDark()

// Initialize theme (called automatically in layout)
themeStore.init()
```

### **Store Values**

```typescript
// Get current theme mode ('light' | 'dark')
$themeStore

// Check if dark mode
$isDark  // boolean

// Check if light mode  
$isLight // boolean
```

## 🎨 **Practical Examples**

### **1. Theme-aware Component**
```svelte
<script lang="ts">
  import { isDark } from '$lib/stores/theme';
</script>

<div class="card {$isDark ? 'bg-gray-800' : 'bg-white'}">
  <h2>Theme-aware content</h2>
  <p>This adapts to the current theme</p>
</div>
```

### **2. Theme Toggle Button**
```svelte
<script lang="ts">
  import { themeStore, isDark } from '$lib/stores/theme';
</script>

<button 
  onclick={() => themeStore.toggle()}
  class="btn variant-filled-primary"
>
  {$isDark ? '☀️ Light' : '🌙 Dark'}
</button>
```

### **3. Programmatic Theme Setting**
```svelte
<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
  
  function setUserPreference(mode: 'light' | 'dark') {
    themeStore.setMode(mode);
    // Save to user profile, etc.
  }
</script>

<div class="theme-options">
  <button onclick={() => setUserPreference('light')}>
    Light Theme
  </button>
  <button onclick={() => setUserPreference('dark')}>
    Dark Theme
  </button>
</div>
```

### **4. Reactive Derived Values**
```svelte
<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
  import { derived } from 'svelte/store';
  
  // Create custom derived stores
  const buttonClass = derived(themeStore, $theme => 
    $theme === 'dark' 
      ? 'bg-gray-800 text-white' 
      : 'bg-white text-gray-800'
  );
  
  const iconColor = derived(themeStore, $theme =>
    $theme === 'dark' ? '#ffffff' : '#000000'
  );
</script>

<button class={$buttonClass}>
  Themed Button
</button>

<svg fill={$iconColor}>
  <!-- SVG content -->
</svg>
```

### **5. Theme-aware API Calls**
```typescript
import { get } from 'svelte/store';
import { themeStore } from '$lib/stores/theme';

export async function saveUserSettings() {
  const currentTheme = get(themeStore);
  
  await fetch('/api/user/settings', {
    method: 'POST',
    body: JSON.stringify({
      theme: currentTheme,
      // other settings...
    })
  });
}
```

## 🔧 **Advanced Usage**

### **Theme Store Subscription**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme';
  
  onMount(() => {
    const unsubscribe = themeStore.subscribe(theme => {
      console.log('Theme changed to:', theme);
      // Perform side effects when theme changes
      // e.g., update chart colors, refresh components, etc.
    });
    
    return unsubscribe;
  });
</script>
```

### **Custom Theme Logic**
```svelte
<script lang="ts">
  import { themeStore, isDark } from '$lib/stores/theme';
  
  // Custom theme switching with animation
  function animatedThemeToggle() {
    // Add transition class
    document.body.classList.add('theme-transition');
    
    // Toggle theme
    themeStore.toggle();
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  }
</script>

<style>
  :global(.theme-transition) {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
</style>
```

## 🎯 **Best Practices**

1. **Always use the store**: Don't create local theme state, use the global store
2. **Use derived stores**: For complex theme-dependent logic
3. **Prefer CSS variables**: Use Tailwind's dark: prefix when possible
4. **Initialize once**: Theme initialization happens automatically in the layout
5. **Type safety**: Use the `ThemeMode` type for type safety

## 🏗️ **Integration Points**

The theme store is already integrated with:
- ✅ **Layout**: Auto-initialization on app start
- ✅ **Mode Toggle**: Theme switching component
- ✅ **Local Storage**: Persistence across sessions
- ✅ **System Preference**: Respects user's OS theme
- ✅ **CSS Variables**: Works with Tailwind dark mode

Now you can use `themeStore` throughout your application for consistent theme management! 🎨