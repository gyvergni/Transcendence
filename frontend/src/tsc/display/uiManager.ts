import {MatchSetup} from "../utils/models.js";
import { loadSettings } from "../features/settings.js";
import { DashboardContext, MatchStatsResponse } from "../features/stats.js";


export class UIManager {
    private currentView: string = "login";
    private isAnimating = false;
    private friendsPseudo: string | null = null;
    private matchDetail: {match: MatchStatsResponse["matchHistory"][0] | null, info: DashboardContext | null} = {match: null, info: null}
	public doorLeft = document.getElementById("door-left")!;
	public doorRight = document.getElementById("door-right")!;
	public contentInner = document.getElementById("content-inner")!;
	public canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
	public contentBox = document.getElementById("content-box")!;
	match: MatchSetup | null = null;

	public getCurrentView() {
		return this.currentView;
	}

	async setCurrentView(view: string): Promise<void> {
		this.currentView = view;
		loadSettings();
        return ;
	}

	public getIsAnimating() {
		return this.isAnimating;
	}

	public setIsAnimating(value: boolean) {
		this.isAnimating = value;
        return ;
	}

    public getFriendsPseudo()
    {
        return this.friendsPseudo;
    }

    public setFriendsPseudo(friendsPseudo: string | null)
    {
        this.friendsPseudo = friendsPseudo;
        return ;
    }

    public getMatchDetail()
    {
        let md = this.matchDetail;
        return md;
    }

    public setMatchDetail(match: MatchStatsResponse["matchHistory"][0], info: DashboardContext | null)
    {
        this.matchDetail.match = match;
        this.matchDetail.info = info;
        return ;
    }
}




