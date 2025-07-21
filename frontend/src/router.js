import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

const Login = () => import('./views/Login.vue')
const Dashboard = () => import('./views/Dashboard.vue')
const Privacy = () => import('./views/Privacy.vue')

const routes = [
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/privacy', component: Privacy },
    { path: '/', redirect: '/login' },
]

export function createMyRouter() {
    const router = createRouter({
        history: createWebHistory(process.env.NODE_ENV === 'production'
            ? '/gitconnections/'
            : '/'),
        routes,
    })

    // router.js
    router.beforeEach((to, from, next) => {
        const authStore = useAuthStore();

        // Check for token in localStorage
        const token = localStorage.getItem('token');
        if (token && !authStore.isAuthenticated) {
            authStore.token = token;
            authStore.isAuthenticated = true;

            // Try to get user profile to verify token
            authStore.getUserProfile().catch(() => {
                authStore.logout();
                next('/login');
            });
        }

        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
            next('/login');
        } else {
            next();
        }
    });

    return router
}