import { createRouter, createWebHistory } from 'vue-router'
import SettingPage from '../views/SettingPage.vue'
import MainPage from '@/views/MainPage.vue'
import Room from '@/views/room/Room.vue'
import RoomList from '@/views/room/RoomList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: MainPage,
    },
    {
      path: '/room/:roomId',
      name: 'room-by-id',
      props: true,
      component: Room,
    },
    {
      path: '/room',
      name: 'room-list',
      component: RoomList,
    },
    {
      path: '/settings/:settingName',
      name: 'settings-setting-edit',
      props: true,
      component: SettingPage,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
