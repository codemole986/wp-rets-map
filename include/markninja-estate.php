<?php

// error_reporting(E_ALL);
// ini_set('display_errors', 1);

require_once(dirname(__FILE__) . '/markninja-helper.php');
require_once(dirname(__FILE__) . '/markninja-api.php');

class MarkninjaEstate {

    /**
     * A reference to an instance of this class.
     */
    private static $instance;

    /**
     * The array of templates that this plugin tracks.
     */
    protected $templates;
    protected $default;

    public static $searchFields = array(
      array(
        'parcel', 
        'latitude', 
        'longitude', 
        'geo_shape', 
        'address', 
        'loc_no', 
        'loc_common_lot_frac', 
        'loc_dir', 
        'loc_name', 
        'loc_stype', 
        'loc_unit', 
        'loc_city', 
        'loc_state', 
        'zip', 
        'census', 
        'TAXDIST', 
        'ETALFLAG', 
        'OWNER', 
        'OWNER2', 
        'OWNER3', 
        'MAIL_ADDRESS1', 
        'MAIL_ADDRESS2', 
        'MAIL_ADDRESS3', 
        'MAIL_CITY', 
        'MAIL_STATE', 
        'MAIL_COUNTRY', 
        'MAIL_ZIPCODE', 
        'LEGAL_DESCR1', 
        'LEGAL_DESCR2', 
        'LEGAL_DESCR3', 
        'LEGAL_DESCR4', 
        'LEGAL_DESCR5', 
        'LEGAL_DESCR6', 
        'LEGAL_DESCR7', 
        'LANDUSE', 
        'CAPACITY', 
        'ASSDYR', 
        'CONSTYR', 
        'DOCDATE', 
        'DOCNO', 
        'DOCVEST', 
        'SALEPRICE', 
        'SALETYPE', 
        'SALEDATE', 
        'LANDACRES', 
        'FISCALYEAR', 
        'LANDVAL', 
        'IMPVAL', 
        'CEVAL', 
        'TOTVAL', 
        'EXMPTCD', 
        'EXMPTVAL', 
        'LYFISCALYEAR', 
        'LYLANDVAL', 
        'LYIMPVAL', 
        'LYCEVAL', 
        'LYTOTVAL', 
        'LYEXMPTCD', 
        'LYEXMPTVAL', 
        'NBRHOOD', 
        'COMMON_NAME', 
        'ADTYPE', 
        'ADFILE', 
        'ADPAGE', 
        'ADPART', 
        'ADBLKCD', 
        'ADBLK', 
        'ADLOTCD', 
        'ADLOT', 
        'SECTNO', 
        'TOWNSHIP', 
        'RANGE', 
        'SUBNAME', 
        'COMMENTS', 
        'ABATEMENT_TYPE', 
        'MAIL_CAREOF', 
        'aores_RECORD_TYPE', 
        'aores_count', 
        'YEAR_BUILT', 
        'EFFEC_YEAR_BUILT', 
        'QUALITY_CLASS', 
        'TYPE_STORIES', 
        'SUB_FLOOR', 
        'EXTERIOR_WALLS', 
        'ROOF', 
        'HEATING_TYPE', 
        'COOLING_TYPE', 
        'TOTAL_ROOMS', 
        'BEDROOMS', 
        'FAMILY_DEN', 
        'FORMAL_DINI', 
        'BATHROOMS_FULL', 
        'BATHROOMS_HALF', 
        'PLUMBING_FIXTURES', 
        'BUILT_INS', 
        'BI_MICROWAVE', 
        'INTERCOM', 
        'TRASH_COMPACTOR', 
        'BI_REFRIGERATOR', 
        'VACUUM_CLEANER', 
        'HARD_WIRED_SECURITY', 
        'FIREPLACE_HIRANK_COUNT', 
        'FIREPLACE_LORANK_COUNT', 
        'FLOOR_HARDWOOD', 
        'FLOOR_CARPET', 
        'FLOOR_VINYL', 
        'FLOOR_CERAMIC', 
        'FLOOR_MARBLE_GRANITE', 
        'FLOOR_TRAVERTINE', 
        'FLOOR_CONCRETE', 
        'FIRST_FLOOR_SQFT', 
        'SECOND_FLOOR_SQFT', 
        'ABOVE_SECOND_SQFT', 
        'BASEMENT_SQFT', 
        'BASEMENT_FINSQFT', 
        'BASEMENT_OUTSIDE', 
        'CONV_ADD_SQFT', 
        'GRG_TYPE', 
        'GRG_SQFT', 
        'CARPORT_SQFT', 
        'GeoCodeUsed', 
        'created_at', 
        'updated_at', 
        'action'
      ),
      array(
        'AccessibilityFeatures', 
        'ActiveOpenHouseCount', 
        'AdditionalAUSoldTerms', 
        'AdditionalPetRentYN', 
        'AdministrationDeposit', 
        'AdministrationFeeYN', 
        'AdministrationRefund', 
        'AgeRestrictedCommunityYN', 
        'AmtOwnerWillCarry', 
        'AnnualPropertyTaxes', 
        'ApplicationFeeAmount', 
        'ApplicationFeeYN', 
        'ApproxAddlLivArea', 
        'ApproxTotalLivArea', 
        'AppxAssociationFee', 
        'AppxSubfeeAmount', 
        'AppxSubfeePymtTy', 
        'Area', 
        'AssessedImpValue', 
        'AssessedLandValue', 
        'AssessmentBalance', 
        'Assessments', 
        'AssessmentType', 
        'AssessmentYN', 
        'AssociationFeaturesAvailable', 
        'AssociationFee1', 
        'AssociationFee1MQYN', 
        'AssociationFee2', 
        'AssociationFee2MQYN', 
        'AssociationFeeIncludes', 
        'AssociationFeeMQYN', 
        'AssociationFeeYN', 
        'AssociationName', 
        'AssociationPhone', 
        'AuctionDate', 
        'AuctionType', 
        'AVMYN', 
        'BathDownstairsDescription', 
        'BathDownYN', 
        'BathsFull', 
        'BathsHalf', 
        'BathsTotal', 
        'BedandBathDownYN', 
        'BedroomDownstairsYN', 
        'BedroomsTotalPossibleNum', 
        'BedsTotal', 
        'BlockNumber', 
        'BonusSOYN', 
        'BrandedVirtualTour', 
        'Builder', 
        'BuildingDescription', 
        'BuildingNumber', 
        'BuiltDescription', 
        'BuyerPremium', 
        'CableAvailable', 
        'CapRate', 
        'CarportDescription', 
        'Carports', 
        'CashtoAssume', 
        'CensusTract', 
        'City', 
        'CleaningDeposit', 
        'CleaningRefund', 
        'CloseDate', 
        'ClosePrice', 
        'CommunityName', 
        'CompactorYN', 
        'ConditionalDate', 
        'CondoConversionYN', 
        'ConstructionDescription', 
        'ConstructionEstimateEnd', 
        'ConstructionEstimateStart', 
        'ContingencyDesc', 
        'ConvertedGarageYN', 
        'ConvertedtoRealProperty', 
        'CoolingDescription', 
        'CoolingFuel', 
        'CostperUnit', 
        'CountyOrParish', 
        'CourtApproval', 
        'CrossStreet', 
        'CurrentLoanAssumable', 
        'CurrentPrice', 
        'DateAvailable', 
        'Deposit', 
        'Directions', 
        'DishwasherDescription', 
        'DishwasherYN', 
        'DisposalYN', 
        'DOM', 
        'DomModifier_DateTime', 
        'DomModifier_Initial', 
        'DomModifier_StatusRValue', 
        'DownPayment', 
        'DryerIncluded', 
        'DryerUtilities', 
        'EarnestDeposit', 
        'Electricity', 
        'ElementarySchool35', 
        'ElementarySchoolK2', 
        'ElevatorFloorNum', 
        'EnergyDescription', 
        'EnvironmentSurvey', 
        'EquestrianDescription', 
        'EstCloLsedt', 
        'ExistingRent', 
        'ExpenseSource', 
        'ExteriorDescription', 
        'Fence', 
        'FenceType', 
        'FinancingConsidered', 
        'Fireplace', 
        'FireplaceDescription', 
        'FireplaceLocation', 
        'Fireplaces', 
        'FirstEncumbranceAssumable', 
        'FirstEncumbranceBalance', 
        'FirstEncumbrancePayment', 
        'FirstEncumbrancePmtDesc', 
        'FirstEncumbranceRate', 
        'FloodZone', 
        'FlooringDescription', 
        'ForeclosureCommencedYN', 
        'FurnishedYN', 
        'FurnishingsDescription', 
        'Garage', 
        'GarageDescription', 
        'GasDescription', 
        'GatedYN', 
        'GravelRoad', 
        'GreenBuildingCertificationYN', 
        'GreenCertificationRating', 
        'GreenCertifyingBody', 
        'GreenFeatures', 
        'GreenYearCertified', 
        'GrossOperatingIncome', 
        'GrossRentMultiplier', 
        'GroundMountedYN', 
        'HandicapAdapted', 
        'HeatingDescription', 
        'HeatingFuel', 
        'HiddenFranchiseIDXOptInYN', 
        'Highlights', 
        'HighSchool', 
        'HOAMinimumRentalCycle', 
        'HOAYN', 
        'HomeownerAssociationName', 
        'HomeownerAssociationPhoneNo', 
        'HomeProtectionPlan', 
        'HotWater', 
        'HouseFaces', 
        'HouseViews', 
        'IDX', 
        'IDXOptInYN', 
        'Interior', 
        'InternetYN', 
        'JrHighSchool', 
        'JuniorSuiteunder600sqft', 
        'KeyDeposit', 
        'KeyRefund', 
        'KitchenCountertops', 
        'LandlordOwnerPays', 
        'LandscapeDescription', 
        'LandUse', 
        'LastChangeTimestamp', 
        'LastChangeType', 
        'LastListPrice', 
        'LastStatus', 
        'LeaseDescription', 
        'LeaseOptionConsideredY', 
        'LeasePrice', 
        'LeedCertified', 
        'LegalDescription', 
        'Length', 
        'ListAgent_MUI', 
        'ListAgentDirectWorkPhone', 
        'ListAgentFullName', 
        'ListAgentMLSID', 
        'ListingAgreementType', 
        'ListingContractDate', 
        'ListOffice_MUI', 
        'ListOfficeMLSID', 
        'ListOfficeName', 
        'ListOfficePhone', 
        'ListPrice', 
        'Litigation', 
        'LitigationType', 
        'Location', 
        'LotDepth', 
        'LotDescription', 
        'LotFront', 
        'LotFrontage', 
        'LotNumber', 
        'LotSqft', 
        'Maintenance', 
        'Management', 
        'Manufactured', 
        'MapDescription', 
        'MasterBedroomDownYN', 
        'MasterPlan', 
        'MasterPlanFeeAmount', 
        'MasterPlanFeeMQYN', 
        'Matrix_Unique_ID', 
        'MatrixModifiedDT', 
        'MediaRoomYN', 
        'MetroMapCoorXP', 
        'MetroMapPageXP', 
        'MHYrBlt', 
        'MiscellaneousDescription', 
        'MLNumofPropIfforSale', 
        'MLS', 
        'MLSNumber', 
        'Model', 
        'NetAcres', 
        'NODDate', 
        'NOI', 
        'NumAcres', 
        'NumberofFurnishedUnits', 
        'NumberofPets', 
        'NumBldgs', 
        'NumDenOther', 
        'NumFloors', 
        'NumGAcres', 
        'NumLoft', 
        'NumofLoftAreas', 
        'NumofParkingSpacesIncluded', 
        'NumParcels', 
        'NumParking', 
        'NumStorageUnits', 
        'NumTerraces', 
        'NumUnits', 
        'OffMarketDate', 
        'OnSiteStaff', 
        'OnSiteStaffIncludes', 
        'OriginalEntryTimestamp', 
        'OriginalListPrice', 
        'OtherApplianceDescription', 
        'OtherDeposit', 
        'OtherEncumbranceDesc', 
        'OtherIncomeDescription', 
        'OtherRefund', 
        'OvenDescription', 
        'OvenFuel', 
        'OwnerLicensee', 
        'OwnerManaged', 
        'Ownership', 
        'OwnersName', 
        'OwnerWillCarry', 
        'ParcelNumber', 
        'PackageAvailable', 
        'ParkingDescription', 
        'ParkingLevel', 
        'ParkingSpaceIDNum', 
        'PavedRoad', 
        'PendingDate', 
        'PermittedPropertyManager', 
        'PerPetYN', 
        'PetDeposit', 
        'PetDescription', 
        'PetRefund', 
        'PetsAllowed', 
        'PhotoCount', 
        'PhotoExcluded', 
        'PhotoInstructions', 
        'PhotoModificationTimestamp', 
        'PoolDescription', 
        'PoolLength', 
        'PoolWidth', 
        'PostalCode', 
        'PostalCodePlus4', 
        'PoweronorOff', 
        'PreviousParcelNumber', 
        'PriceChangeTimestamp', 
        'PriceChgDate', 
        'PricePerAcre', 
        'PrimaryViewDirection', 
        'ProjAmenitiesDescription', 
        'PropAmenitiesDescription', 
        'PropertyCondition', 
        'PropertyDescription', 
        'PropertyInsurance', 
        'PropertySubType', 
        'PropertyType', 
        'ProviderKey', 
        'ProviderModificationTimestamp', 
        'PublicAddress', 
        'PublicAddressYN', 
        'PublicRemarks', 
        'PvPool', 
        'Range', 
        'RATIO_ClosePrice_By_ListPrice', 
        'RATIO_ClosePrice_By_OriginalListPrice', 
        'RATIO_CurrentPrice_By_SQFT', 
        'RealtorYN', 
        'RefrigeratorDescription', 
        'RefrigeratorYN', 
        'RentedPrice', 
        'RentRange', 
        'RentTermsDescription', 
        'RepoReoYN', 
        'Road', 
        'RoofDescription', 
        'RoomCount', 
        'SaleOfficeBonusYN', 
        'SaleType', 
        'SecondEncumbranceAssumable', 
        'SecondEncumbranceBalance', 
        'SecondEncumbrancePayment', 
        'SecondEncumbrancePmtDesc', 
        'SecondEncumbranceRate', 
        'Section', 
        'Section8ConsideredYN', 
        'Security', 
        'SecurityDeposit', 
        'SecurityRefund', 
        'SellerContribution', 
        'SellingAgent_MUI', 
        'SellingAgentDirectWorkPhone', 
        'SellingAgentFullName', 
        'SellingAgentMLSID', 
        'SellingOffice_MUI', 
        'SellingOfficeMLSID', 
        'SellingOfficeName', 
        'SellingOfficePhone', 
        'SeparateMeter', 
        'ServiceContractInc', 
        'ServicesAvailableOnSite', 
        'Sewer', 
        'ShortSale', 
        'ShowingAgentPublicID', 
        'SIDLIDAnnualAmount', 
        'SIDLIDBalance', 
        'SIDLIDYN', 
        'SolarElectric', 
        'SoldAppraisal_NUMBER', 
        'SoldBalloonAmt', 
        'SoldBalloonDue', 
        'SoldDownPayment', 
        'SoldLeaseDescription', 
        'SoldOWCAmt', 
        'SoldTerm', 
        'Spa', 
        'SpaDescription', 
        'SqFtTotal', 
        'StateOrProvince', 
        'Status', 
        'StatusChangeTimestamp', 
        'StatusContractualSearchDate', 
        'StatusUpdate', 
        'StorageSecure', 
        'StorageUnitDesc', 
        'StorageUnitDim', 
        'StreetDirPrefix', 
        'StreetDirSuffix', 
        'StreetName', 
        'StreetNumber', 
        'StreetNumberNumeric', 
        'StreetSuffix', 
        'StudioYN', 
        'Style', 
        'SubdivisionName', 
        'SubdivisionNumber', 
        'SubdivisionNumSearch', 
        'SubjecttoFIRPTAYN', 
        'Table', 
        'TaxDistrict', 
        'TempOffMarketDate', 
        'TempOffMrktStatusDesc', 
        'TenantPays', 
        'TermsOwnerWillCarry', 
        'TerraceLocation', 
        'TerraceTotalSqft', 
        'TerrainDescription', 
        'ThreeQtrBaths', 
        'TotalFloors', 
        'TotalNumofParkingSpaces', 
        'TowerName', 
        'Town', 
        'Township', 
        'TransactionType', 
        'Trash', 
        'TStatusDate', 
        'Type', 
        'TypeOwnerWillCarry', 
        'UnitCount', 
        'UnitDescription', 
        'UnitNumber', 
        'UnitPoolIndoorYN', 
        'UnitSpaIndoor', 
        'Utilities', 
        'UtilitiesIncl', 
        'UtilityInformation', 
        'Views', 
        'VirtualTourLink', 
        'Washer', 
        'WasherDryerDescription', 
        'WasherDryerIncluded', 
        'WasherDryerLocation', 
        'WasherIncluded', 
        'Water', 
        'WaterHeaterDescription', 
        'WeightLimit', 
        'Width', 
        'YearBuilt', 
        'YearlyOperatingExpense', 
        'YearlyOperatingIncome', 
        'YearlyOtherIncome', 
        'YearRoundSchoolYN', 
        'YrsRemaining', 
        'Zoning', 
        'ZoningAuthority', 
        'xLastCheckingDt'
      ),
      array(),
    );

    public static $searchTypes = array(
      ['parcel', 'Parcel', ['parcel', 'by_radius', 'rad']],
      ['address', 'Address', ['addr']],
      // ['radius', 'Radius', ['radius','lat','lng']],
      ['status', 'Status', ['status']],
      ['custom', 'Custom', ['custom']],
    );

    public static $searchKeys = array('parcel', 'by_radius', 'rad','addr', 'by_radius_addr', 'rad_addr','status','radius','lat','lng','custom');
    public static $otherKeys = array('rect', 'page', 'limit', 'order_type');

    /**
     * Returns an instance of this class. 
     */
    public static function get_instance() {

        if ( null == self::$instance ) {
            self::$instance = new MarkninjaEstate();
        } 
        return self::$instance;

    } 

    /**
     * Initializes the plugin by setting filters and administration functions.
     */
    private function __construct() {
        $this->apply_options();
        $this->apply_jss_css();
        $this->apply_template();
        $this->apply_shortcode();
        $this->apply_menu();
        $this->handle_ajax();
        $this->handle_others();
    } 

    public function handle_others() {
        add_action( 'wp_head', array($this, 'render_head_client') );
        add_action( 'init', array($this, 'apply_map_url') );
        add_filter( 'query_vars', array($this, 'apply_query_vars') );
        add_action( 'parse_request', array($this, 'apply_parse_request') );
    }

    public function apply_parse_request(&$wp) {
        if ( array_key_exists( 'mnj_map_static_page', $wp->query_vars ) ) {

            include dirname(dirname(__FILE__)) . '/templates/map_view.php';
            exit();
        }
        return;
    }

    public function apply_query_vars($query_vars ) {
        $query_vars[] = 'mnj_map_static_page';
        return $query_vars;
    }

    public function apply_map_url() {
        add_rewrite_rule( '^markninja_map_search(.*)$', 'index.php?mnj_map_static_page=1', 'top' );

        global $wp_rewrite;
        $wp_rewrite->flush_rules( false );
        return;

        global $wp_rewrite;
        $plugin_url = plugins_url( 'templates/map_view.php', dirname(__FILE__ ));
        $plugin_url = substr( $plugin_url, strlen( home_url() ) + 1 );
        // The pattern is prefixed with '^'
        // The substitution is prefixed with the "home root", at least a '/'
        // This is equivalent to appending it to `non_wp_rules`
        // echo $plugin_url;

        $wp_rewrite->add_external_rule( 'markninja_map_search.php$', $plugin_url );
    }

    public function render_head_client() {
        echo '<script type="text/javascript">
           var ajaxurl = "' . admin_url('admin-ajax.php') . '";
           var pluginurl = "' . plugin_dir_url(dirname(__FILE__)) . '";
         </script>';
     }

    public function handle_ajax() {
        add_action( 'wp_ajax_mnj_estate_search', array($this, 'ajax_mnj_estate_search') );
        add_action( 'wp_ajax_mnj_estate_retrieve', array($this, 'ajax_mnj_estate_retrieve') );
        add_action( 'wp_ajax_mnj_estate_list', array($this, 'ajax_mnj_estate_list') );
        add_action( 'wp_ajax_mnj_estate_load', array($this, 'ajax_mnj_estate_load') );
    }

    public function ajax_mnj_estate_search() {
        $addr = $_REQUEST['q'];
        $api = new MarkninjaAPI();
        $result = $api->lookup(array('addr' => $addr));

        $list = array();
        foreach ($result['data'] as $row) {
            $list[] = array(
                $row['addr'],
                $row['parcel'],
                $row['cnt'],
            );
        }
        
        header('Content-Type: application/json');
        echo Markninja_Helper::json_encode($list);
        exit;
    }

    public function ajax_mnj_estate_retrieve() {


        $params = [];
        foreach (self::$searchKeys as $key) {
            if(isset($_REQUEST[$key]))  $params[$key] = $_REQUEST[$key];
        }
        foreach (self::$otherKeys as $key) {
            if(isset($_REQUEST[$key]))  $params[$key] = $_REQUEST[$key];
        }
        $params = Markninja_Helper::make_data_safe($params);

        $api = new MarkninjaAPI(null, null, isset($_REQUEST['debug']));
        $result = $api->search($params);
        header('Content-Type: application/json');
        echo Markninja_Helper::json_encode($result);
        exit;
    }

    public function ajax_mnj_estate_list() {
        
        $params = [];
        foreach (self::$searchKeys as $key) {
            if(isset($_REQUEST[$key]))  $params[$key] = $_REQUEST[$key];
        }
        foreach (self::$otherKeys as $key) {
            if(isset($_REQUEST[$key]))  $params[$key] = $_REQUEST[$key];
        }
        $params = Markninja_Helper::make_data_safe($params);
        
        $api = new MarkninjaAPI(null, null, isset($_REQUEST['debug']));
        $result = $api->getList($params);
        header('Content-Type: application/json');
        echo Markninja_Helper::json_encode($result);
        exit;

    }

    public function ajax_mnj_estate_load() {
        
        $api = new MarkninjaAPI();
        $parcel = $_REQUEST['parcel'];

        $result = [
            'error' => 1,
            'msg' => 'Parcel is not given.',
        ];

        if ($parcel) {
            $params = ['parcel' => $parcel];    
            $result = $api->load($params);
        }

        header('Content-Type: application/json');
        echo Markninja_Helper::json_encode($result);
        exit;
    }

    public function apply_options() {
        $this->default = array (
            'mnj_google_api_key'        => '',
            'mnj_estate_api_key'        => '',
            'mnj_estate_api_secret'     => '',
        );

        foreach ($this->default as $key => $value) {
            register_setting( 'mnj-estate-group', $key );

            $opt = get_option($key);
            if (!$opt) {
                update_option( $key, $value );
            }
        }
    }

    public function apply_menu() {
        add_action( 'admin_menu', array($this, 'add_admin_menu') );
    }

    public function add_admin_menu() {
        add_menu_page('Markninja Estate Settings', 'Markninja Estate Settings', 'administrator', 'mnj-estate-settings', array($this, 'admin_settings'), 'dashicons-admin-generic');
    }
    
    public function admin_settings() {
        // Update options
        if (isset($_REQUEST['action_type']) && ($_REQUEST['action_type'] == 'update')) {
            
            foreach ($this->default as $opt => $def) {
                if (isset($_REQUEST[$opt])) {
                    update_option($opt, Markninja_Helper::make_data_safe($_REQUEST[$opt]));
                }
            }
        }

        include (dirname(dirname(__FILE__)) . '/pages/view_settings.tpl');
    }

    public function apply_jss_css() {
        add_action( 'wp_enqueue_scripts', array($this, 'apply_jss_css_client' ) );
        add_action( 'admin_enqueue_scripts', array($this, 'apply_jss_css_admin' ) );
    }
    public function apply_jss_css_admin() {
        if ( is_admin() ) { 
            wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',false,'3.3.7','all');
            wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js', array ( 'jquery' ), '3.3.7', true);

            wp_enqueue_script( 'mnj_admin', plugin_dir_url(dirname(__FILE__)) . '/public/js/admin-script.js', array ( 'jquery' ), '1.1', true);

            wp_enqueue_style( 'mnj_admin', plugin_dir_url(dirname(__FILE__)) . '/public/css/admin.css',false,'1.0','all');
        }
    }

    public function apply_jss_css_client() {
        if ( !is_admin() ) {
            
            wp_enqueue_style( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',false,'3.3.7','all');
            wp_enqueue_script( 'bootstrap', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js', array ( 'jquery' ), '3.3.7', true);

            // wp_enqueue_style( 'jquery-ui', plugin_dir_url(dirname(__FILE__)) . '/public/js/jquery-ui-1.12.1.custom/jquery-ui.min.css',false,'1.12.1','all');
            // wp_enqueue_script( 'jquery-ui', plugin_dir_url(dirname(__FILE__)) . '/public/js/jquery-ui-1.12.1.custom/jquery-ui.min.js', array ( 'jquery' ), '1.12.1', true);

            wp_enqueue_style( 'jquery-autocompete', plugin_dir_url(dirname(__FILE__)) . '/public/js/jQuery-autoComplete/jquery.auto-complete.css',false,'1.0.7','all');
            wp_enqueue_script( 'jquery-autocompete', plugin_dir_url(dirname(__FILE__)) . '/public/js/jQuery-autoComplete/jquery.auto-complete.min.js', array ( 'jquery' ), '1.0.7', true);

            wp_enqueue_style( 'fancybox', plugin_dir_url(dirname(__FILE__)) . '/public/js/fancyapps-fancyBox/source/jquery.fancybox.css',false,'2.1','all');
            wp_enqueue_script( 'fancybox', plugin_dir_url(dirname(__FILE__)) . '/public/js/fancyapps-fancyBox/source/jquery.fancybox.js', array ( 'jquery' ), '2.1', true);
            wp_enqueue_script( 'mnj_frontend', plugin_dir_url(dirname(__FILE__)) . '/public/js/frontend-script.js' . '?' . uniqid(), array ( 'jquery' ), '1.0.2', true);
            
            wp_enqueue_script( 'bootstrap-notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/bootstrap-notify/bootstrap-notify.min.js', array ( 'bootstrap' ), '1.0.0', true);
            
            wp_enqueue_style( 'slick', plugin_dir_url(dirname(__FILE__)) . '/public/js/slick/slick/slick.css',false,'1.0.0','all');
            wp_enqueue_style( 'slick-theme', plugin_dir_url(dirname(__FILE__)) . '/public/js/slick/slick/slick-theme.css',false,'1.0.0','all');
            wp_enqueue_script( 'slick', plugin_dir_url(dirname(__FILE__)) . '/public/js/slick/slick/slick.min.js', array ( 'jquery' ), '1.0.0', true);

            wp_enqueue_script( 'twbs-pagination', plugin_dir_url(dirname(__FILE__)) . '/public/js/esimakin-twbs-pagination/jquery.twbsPagination.min.js', array ( 'jquery' ), '1.0.0', true);

            wp_enqueue_script( 'moment', plugin_dir_url(dirname(__FILE__)) . '/public/js/moment/moment.js', false, '1.0.0', true);
            wp_enqueue_script( 'humanize_dur', plugin_dir_url(dirname(__FILE__)) . '/public/js/HumanizeDuration.js/humanize-duration.js', array ( 'moment' ), '1.0.0', true);

            wp_enqueue_script( 'mnj-plugins', plugin_dir_url(dirname(__FILE__)) . '/public/js/plugins.js', array ( 'jquery' ), '1.0.1', true);
            wp_enqueue_script( 'mnj-notify', plugin_dir_url(dirname(__FILE__)) . '/public/js/notify.js', array ( 'bootstrap-notify' ), '1.0.0', true);

            wp_enqueue_style( 'mnj_frontend', plugin_dir_url(dirname(__FILE__)) . '/public/css/frontend.css',false,'1.0.3','all');

        }
    }

    public function apply_shortcode() {
        add_shortcode("mnj_estate_searchbox", array($this, 'mnj_process_searchbox') );
        add_shortcode("mnj_estate_searchpage", array($this, 'mnj_process_searchpage') );
    }

    public function mnj_process_searchbox($atts) {
        $attr = shortcode_atts(array('url'=>''), $atts);

        $submit_url = $attr['url'];
        if (!$submit_url) $submit_url = get_site_url() . '/markninja_map_search';
        $content = ''; 
        ob_start();
    ?>
    <form action="<?php echo $submit_url; ?>" method="GET">
        <div class="input-group">
          <input type="hidden" class="mjn_finder_parcel" name="parcel" >
          <input type="text" class="mjn_finder_address form-control" name="addr" >
          <div class="input-group-btn">
            <button type="submit" class="btn btn-default">Search</button>
          </div>
        </div>
    </form>
    <?php    
        $content = ob_get_clean();

        // should put html, js code needed

        return $content;
    }

    public function mnj_process_searchpage() {
        ob_start();
        include(dirname(dirname(__FILE__)) . "/pages/inner_map_search.tpl");
        $content = ob_get_clean();
        return $content;
    }

    public function apply_template() {
        $this->templates = array();

        // Add a filter to the attributes metabox to inject template into the cache.
        if ( version_compare( floatval( get_bloginfo( 'version' ) ), '4.7', '<' ) ) {

            // 4.6 and older
            add_filter(
                'page_attributes_dropdown_pages_args',
                array( $this, 'register_project_templates' )
            );

        } else {

            // Add a filter to the wp 4.7 version attributes metabox
            add_filter(
                'theme_page_templates', array( $this, 'add_new_template' )
            );

        }

        // Add a filter to the save post to inject out template into the page cache
        add_filter(
            'wp_insert_post_data', 
            array( $this, 'register_project_templates' ) 
        );


        // Add a filter to the template include to determine if the page has our 
        // template assigned and return it's path
        add_filter(
            'template_include', 
            array( $this, 'view_project_template') 
        );

        // Add your templates to this array.
        $this->templates = array(
            'tpl-estate-map.php' => 'Markninja Estate Map',
        );
    }

    /**
     * Adds our template to the page dropdown for v4.7+
     *
     */
    public function add_new_template( $posts_templates ) {
        $posts_templates = array_merge( $posts_templates, $this->templates );
        return $posts_templates;
    }

    /**
     * Adds our template to the pages cache in order to trick WordPress
     * into thinking the template file exists where it doens't really exist.
     */
    public function register_project_templates( $atts ) {

        // Create the key used for the themes cache
        $cache_key = 'page_templates-' . md5( get_theme_root() . '/' . get_stylesheet() );

        // Retrieve the cache list. 
        // If it doesn't exist, or it's empty prepare an array
        $templates = wp_get_theme()->get_page_templates();
        if ( empty( $templates ) ) {
            $templates = array();
        } 

        // New cache, therefore remove the old one
        wp_cache_delete( $cache_key , 'themes');

        // Now add our template to the list of templates by merging our templates
        // with the existing templates array from the cache.
        $templates = array_merge( $templates, $this->templates );

        // Add the modified cache to allow WordPress to pick it up for listing
        // available templates
        wp_cache_add( $cache_key, $templates, 'themes', 1800 );

        return $atts;

    } 

    /**
     * Checks if the template is assigned to the page
     */
    public function view_project_template( $template ) {
        
        // Get global post
        global $post;

        // Return template if post is empty
        if ( ! $post ) {
            return $template;
        }

        // Return default template if we don't have a custom one defined
        if ( ! isset( $this->templates[get_post_meta( 
            $post->ID, '_wp_page_template', true 
        )] ) ) {
            return $template;
        } 

        $file = plugin_dir_path(dirname( __FILE__)) . "templates/" . get_post_meta( 
            $post->ID, '_wp_page_template', true
        );

        // Just to be safe, we check if the file exist first
        if ( file_exists( $file ) ) {
            return $file;
        } else {
            echo $file;
        }

        // Return template
        return $template;

    }

}