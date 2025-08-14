import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-press-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './press-list.component.html',
  styleUrl: './press-list.component.scss'
})
export class PressListComponent {
pressArticles = [
    { id: 1, title: 'DJ Seborn Breaks the Mold', thumb: 'assets/press/thumb1.jpg' },
    { id: 2, title: 'The Future of Electronic Music', thumb: 'assets/press/thumb2.jpg' },
  ];

  constructor(private router: Router) {}

  openArticle(id: number) {
    this.router.navigate(['/press', id]);
  }
}
