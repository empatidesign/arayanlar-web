import PropTypes from "prop-types";
import React, { useEffect, useCallback, useRef } from "react";

// //Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";
import withRouter from "components/Common/withRouter";
import { Link, useLocation } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";

const SidebarContent = props => {
  const location = useLocation();
  const ref = useRef();
  const path = location.pathname;

  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag
        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.length && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = location.pathname;
    const fullPath = pathName;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (fullPath === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }

    // Saat yönetimi sayfalarında saat menüsünü aktif et ve diğer menüyü kapat
    if (fullPath.includes('/admin/watch-')) {
      const watchMenuItem = document.getElementById('watch-management-menu');
      const carMenuItem = document.getElementById('car-management-menu');
      const housingMenuItem = document.getElementById('housing-management-menu');
      if (carMenuItem) {
        // araba menüsünü kapat
        carMenuItem.classList.remove('mm-active');
        const carSubMenu = carMenuItem.nextElementSibling;
        if (carSubMenu) carSubMenu.classList.remove('mm-show');
      }
      if (housingMenuItem) {
        // konut menüsünü kapat
        housingMenuItem.classList.remove('mm-active');
        const housingSubMenu = housingMenuItem.nextElementSibling;
        if (housingSubMenu) housingSubMenu.classList.remove('mm-show');
      }
      if (watchMenuItem) {
        activateParentDropdown(watchMenuItem);
      }
    }
    // Araba yönetimi sayfalarında araba menüsünü aktif et ve diğer menüyü kapat
    else if (fullPath.includes('/admin/car-')) {
      const carMenuItem = document.getElementById('car-management-menu');
      const watchMenuItem = document.getElementById('watch-management-menu');
      const housingMenuItem = document.getElementById('housing-management-menu');
      if (watchMenuItem) {
        // saat menüsünü kapat
        watchMenuItem.classList.remove('mm-active');
        const watchSubMenu = watchMenuItem.nextElementSibling;
        if (watchSubMenu) watchSubMenu.classList.remove('mm-show');
      }
      if (housingMenuItem) {
        // konut menüsünü kapat
        housingMenuItem.classList.remove('mm-active');
        const housingSubMenu = housingMenuItem.nextElementSibling;
        if (housingSubMenu) housingSubMenu.classList.remove('mm-show');
      }
      if (carMenuItem) {
        activateParentDropdown(carMenuItem);
      }
    }
    // Konut yönetimi sayfalarında konut menüsünü aktif et ve diğer menüyü kapat
    else if (fullPath.includes('/admin/districts') || fullPath.includes('/admin/housing-')) {
      const housingMenuItem = document.getElementById('housing-management-menu');
      const carMenuItem = document.getElementById('car-management-menu');
      const watchMenuItem = document.getElementById('watch-management-menu');
      if (carMenuItem) {
        // araba menüsünü kapat
        carMenuItem.classList.remove('mm-active');
        const carSubMenu = carMenuItem.nextElementSibling;
        if (carSubMenu) carSubMenu.classList.remove('mm-show');
      }
      if (watchMenuItem) {
        // saat menüsünü kapat
        watchMenuItem.classList.remove('mm-active');
        const watchSubMenu = watchMenuItem.nextElementSibling;
        if (watchSubMenu) watchSubMenu.classList.remove('mm-show');
      }
      if (housingMenuItem) {
        activateParentDropdown(housingMenuItem);
      }
    }
  }, [path, activateParentDropdown]);

  // Yeni: üst menü başlıklarına tıklayınca manuel toggle
  const toggleTopMenu = useCallback((menuId) => (e) => {
    e.preventDefault();
    try {
      const anchor = document.getElementById(menuId);
      if (!anchor) return;
      const li = anchor.parentElement;
      const sub = anchor.nextElementSibling;
      const isOpen = li && li.classList.contains('mm-active');

      // Tüm üst menüleri kapat
      ['car-management-menu', 'watch-management-menu', 'housing-management-menu'].forEach(id => {
        const a = document.getElementById(id);
        if (!a) return;
        const liEl = a.parentElement;
        const subEl = a.nextElementSibling;
        a.classList.remove('mm-active');
        if (liEl) liEl.classList.remove('mm-active');
        if (subEl) subEl.classList.remove('mm-show');
      });

      // Tıklanan menüyü aç/kapat
      if (!isOpen) {
        if (li) li.classList.add('mm-active');
        anchor.classList.add('mm-active');
        if (sub) sub.classList.add('mm-show');
      }
    } catch (err) {
      console.error('Sidebar toggle error:', err);
    }
  }, []);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar style={{ maxHeight: "100%" }} ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">Ana Menü</li>
            
            <li>
              <Link to="/dashboard" className="waves-effect">
                <i className="ti-home"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="menu-title">Yönetim</li>

            <li>
              <Link to="/admin/users" className="waves-effect">
                <i className="ti-user"></i>
                <span>Kullanıcılar</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/reports" className="waves-effect">
                <i className="ti-flag"></i>
                <span>Şikayetler</span>
              </Link>
            </li>

            

            <li>
              <Link to="/admin/categories" className="waves-effect">
                <i className="ti-tag"></i>
                <span>Kategoriler</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/sliders" className="waves-effect">
                <i className="ti-image"></i>
                <span>Slider</span>
              </Link>
            </li>

          

            <li>
              <Link to="#" className="has-arrow waves-effect" id="car-management-menu" onClick={toggleTopMenu('car-management-menu')}>
                <i className="ti-car"></i>
                <span>Araba Yönetimi</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/admin/car-brands">Markalar</Link>
                </li>
                <li>
                  <Link to="/admin/car-models">Modeller</Link>
                </li>
                <li>
                  <Link to="/admin/car-listings">Araba İlanları</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="#" className="has-arrow waves-effect" id="watch-management-menu" onClick={toggleTopMenu('watch-management-menu')}>
                <i className="mdi mdi-watch"></i>
                <span>Saat Yönetimi</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/admin/watch-brands">Markalar</Link>
                </li>
                <li>
                  <Link to="/admin/watch-models">Modeller</Link>
                </li>
                <li>
                  <Link to="/admin/watch-listings">Saat İlanları</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="#" className="has-arrow waves-effect" id="housing-management-menu" onClick={toggleTopMenu('housing-management-menu')}>
                <i className="mdi mdi-home-city"></i>
                <span>Konut Yönetimi</span>
              </Link>
              <ul className="sub-menu" aria-expanded="false">
                <li>
                  <Link to="/admin/districts">İlçeler</Link>
                </li>
                <li>
                  <Link to="/admin/housing-listings">Konut İlanları</Link>
                </li>
              </ul>
            </li>

          

            <li className="menu-title">Ayarlar</li>

            <li>
              <Link to="/admin/listing-schedule" className="waves-effect">
                <i className="ti-time"></i>
                <span>İlan Zamanlaması</span>
              </Link>
            </li>

            <li>
              <Link to="/admin/listing-limits" className="waves-effect">
                <i className="ti-control-stop"></i>
                <span>İlan Limitleri</span>
              </Link>
            </li>

            
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
