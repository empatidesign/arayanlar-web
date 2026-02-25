import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";
import { get } from "../../../helpers/backend_helper";
import { withTranslation } from "react-i18next";

const NotificationDropdown = props => {
  const [menu, setMenu] = useState(false);
  const [counts, setCounts] = useState({ cars: 0, housing: 0, watches: 0, total: 0 });

  const fetchCounts = async () => {
    try {
      const res = await get("/api/admin/pending-counts");
      if (res.success) setCounts(res.data);
    } catch (e) {
      // sessiz hata
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { label: "Araba İlanları", count: counts.cars, icon: "mdi mdi-car", color: "primary", path: "/admin/car-listings" },
    { label: "Ev İlanları", count: counts.housing, icon: "mdi mdi-home", color: "success", path: "/admin/housing-listings" },
    { label: "Saat İlanları", count: counts.watches, icon: "mdi mdi-watch", color: "warning", path: "/admin/watch-listings" },
  ];

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          className="btn header-item noti-icon waves-effect"
          tag="button"
          id="page-header-notifications-dropdown"
        >
          <i className="mdi mdi-bell-outline"></i>
          {counts.total > 0 && (
            <span className="badge bg-danger rounded-pill">{counts.total}</span>
          )}
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3 border-bottom">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0 font-size-16">Onay Bekleyen İlanlar</h6>
              </Col>
              {counts.total > 0 && (
                <Col className="col-auto">
                  <span className="badge bg-danger">{counts.total} bekliyor</span>
                </Col>
              )}
            </Row>
          </div>

          <div className="p-2">
            {counts.total === 0 ? (
              <div className="text-center py-3 text-muted">
                <i className="mdi mdi-check-circle font-size-24 d-block mb-1"></i>
                <span className="font-size-13">Bekleyen ilan yok</span>
              </div>
            ) : (
              categories.map(cat => cat.count > 0 && (
                <Link
                  key={cat.path}
                  to={`${cat.path}?status=pending`}
                  className="text-reset notification-item"
                  onClick={() => setMenu(false)}
                >
                  <div className="d-flex align-items-center p-2">
                    <div className="avatar-xs me-3 flex-shrink-0">
                      <span className={`avatar-title bg-${cat.color} rounded-circle font-size-16`}>
                        <i className={cat.icon}></i>
                      </span>
                    </div>
                    <div className="flex-1">
                      <h6 className="mt-0 mb-0">{cat.label}</h6>
                      <span className="font-size-12 text-muted">{cat.count} ilan onay bekliyor</span>
                    </div>
                    <span className={`badge bg-${cat.color} ms-2`}>{cat.count}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

NotificationDropdown.propTypes = {
  t: PropTypes.any
};

export default withTranslation()(NotificationDropdown);
