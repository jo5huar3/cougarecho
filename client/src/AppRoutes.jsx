import Home from './components/Home';
import Homepage from './components/Homepage/Homepage';
import Login from './components/login/Login';
import Register from "./components/register/Register";
import Confirm from './components/confirm/Confirm';// Updated import path
import Admin from "./components/admin/Admin";
import Edit from './components/edit/Edit';
import Search from './components/search/Search';
import Listener from './components/listener/Listener';
import Artist from "./components/artistpage/Artist";
import AlbumPage from "./components/albumpage/Albumpage";
import Library from "./components/library/Library";
import Newalbum from './components/albumpage/Newalbum';
import Playlist from './components/playlist/Playlist';
import Newplaylist from './components/playlist/Newplaylist';
import ArtistProfile from './components/artistpage/Artistprofile';
import Player from './components/songplayer/Player';
import Tracking from './components/admin/Tracking';
import Newtrack from './components/admin/Newtrack';
import Makeadmin from './components/admin/Makeadmin';
import SongRating from './components/report/Songrating';
import UserRating from './components/report/Userrating';
import ArtistRating from './components/report/Artistrating';
import Notification from './components/notification/Notification';

export const PublicRoutes = [
  {
    index: true,
    element: <Home />
  },

  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/playlist/:id',  // This new route allows for dynamic playlist IDs
    element: <Playlist />
  },
  {
    path: '/confirm',
    element: <Confirm />
  },

  {
    path: '/tracking',
    element: <Tracking />
  },

  {
    path: '/newtrack',
    element: <Newtrack />
  },

  {
    path: '/artistprofile',
    element: <ArtistProfile />
  },

  {
    path: '/album/:album_id',
    element: <AlbumPage />
  },
  {
    path: '/player',
    element: <Player />
  },
  {
    path: '/userlibrary',
    element: <Library />
  },
  {
    path: '/search',
    element: <Search />
  },
  {
    path: '/newplaylist',
    element: <Newplaylist />
  },
  {
    path: '/playlist',
    element: <Playlist />
  },
  {
    path: '/player',
    element: <Player />
  },
  {
    path: '/userlibrary',
    element: <Library />
  },
  {
    path: '/homepage',
    element: <Homepage />
  },

  {
    path: '/playlist',
    element: <Playlist />
  },
  {
    path: '/useredit',
    element: <Edit />
  },
  {
    path: '/homepage',
    element: <Homepage />
  },

  //adding report path
  {
    path: '/notifications',
    element: <Notification />
  },
  {
    path: '/song-rating',
    element: <SongRating />
  },
  {
    path: '/artist-rating',
    element: <ArtistRating />
  },
  {
    path: '/user-rating',
    element: <UserRating />
  },

  {
    path: '/newalbum',
    element: <Newalbum />
  },

];
export const ListenerRoutes = [

  {
    path: '/listener',
    element: <Listener />
  },



]
export const ArtistRoutes = [
  {
    path: '/artist',
    element: <Artist />
  },
  {
    path: '/artist/:id',
    element: <Artist />
  },


]
export const AdminRoutes = [


  {
    path: '/admin',
    element: <Admin />
  },
  {
    path: '/makeadmin',
    element: <Makeadmin />
  },


]
const AppRoutes = [
  ...PublicRoutes,
  ...ListenerRoutes,
  ...ArtistRoutes,
  ...AdminRoutes
]
export default AppRoutes;