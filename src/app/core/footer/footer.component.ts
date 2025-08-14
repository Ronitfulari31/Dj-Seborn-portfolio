import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
public currentYear = new Date().getFullYear();

}
